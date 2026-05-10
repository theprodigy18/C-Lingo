// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "AuthRepository.hpp"

#include <Model/DatabaseToModelMapper.hpp>

namespace CLingo
{
    AuthRepository::AuthRepository(UserCache& userCache)
        : m_UserCache{userCache} {}

    bool AuthRepository::EmailExists(PooledConnection& conn, const std::string& email)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec(R"(
                                SELECT 1 FROM users
                                WHERE email = $1 LIMIT 1
                                )",
                             pqxx::params{email})};

        return !result.empty();
    }

    bool AuthRepository::UsernameExists(PooledConnection& conn, const std::string& username)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec(R"(
                                SELECT 1 FROM users
                                WHERE username = $1 LIMIT 1
                                )",
                             pqxx::params{username})};

        return !result.empty();
    }

    std::optional<Model::User> AuthRepository::FindByEmail(PooledConnection& conn, const std::string& email)
    {
        auto cached{m_UserCache.GetByEmail(email)};
        if (cached)
            return *cached;

        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec(R"(
                                SELECT id, username, display_name, email, password_hash, is_verified, avatar_url,
                                aura, energy, last_energy_refill, current_streak, longest_streak, last_login_data, created_at
                                FROM users
                                WHERE email = $1 LIMIT 1
                                )",
                             pqxx::params{email})};

        if (result.empty())
            return std::nullopt;

        auto user{Model::MapUser(result[0])};
        m_UserCache.Set(user);

        return user;
    }

    std::optional<Model::User> AuthRepository::FindById(PooledConnection& conn, i32 userId)
    {
        auto cached{m_UserCache.GetById(userId)};
        if (cached)
            return *cached;

        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec(R"(
                                SELECT id, username, display_name, email, password_hash, is_verified, avatar_url,
                                aura, energy, last_energy_refill, current_streak, longest_streak, last_login_data, created_at
                                FROM users
                                WHERE id = $1 LIMIT 1
                                )",
                             pqxx::params{userId})};

        if (result.empty())
            return std::nullopt;

        auto user{Model::MapUser(result[0])};
        m_UserCache.Set(user);

        return user;
    }

    Model::User AuthRepository::CreateUser(
        PooledConnection& conn,
        const std::string& username,
        const std::string& email,
        const std::string& passwordHash)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec(R"(
                                INSERT INTO users (username, display_name, email, password_hash, is_verified)
                                VALUES ($1, $1, $2, $3, FALSE)
                                RETURNING id, username, display_name, email, password_hash, is_verified, avatar_url,
                                aura, energy, last_energy_refill, current_streak, longest_streak, last_login_data, created_at
                                )",
                             pqxx::params{username, email, passwordHash})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to create user");

        auto user{Model::MapUser(result[0])};
        m_UserCache.Set(user);

        return user;
    }

    void AuthRepository::VerifyUser(PooledConnection& conn, i32 userId)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec(R"(
                                    UPDATE users
                                    SET is_verified = TRUE
                                    WHERE id = $1
                                    RETURNING id
                                    )",
                             pqxx::params{userId})};

        txn.commit();

        if (result.empty())
            throw NotFoundError("User not found");

        m_UserCache.Invalidate(userId);
    }

    void AuthRepository::CreateToken(
        PooledConnection& conn,
        i32 userId,
        const std::string& token,
        const std::string& type,
        std::chrono::seconds expiresIn)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec(R"(
                                INSERT INTO auth_tokens(user_id, token, type, expires_at)
                                VALUES($1, $2, $3, NOW() + $4 * INTERVAL '1 second')
                                RETURNING id
                                )",
                             pqxx::params{userId, token, type, static_cast<i32>(expiresIn.count())})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to create auth token");
    }

    std::optional<Model::AuthToken> AuthRepository::FindValidToken(
        PooledConnection& conn,
        const std::string& token,
        const std::string& type)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec(R"(
                                SELECT id, user_id, token, type, expires_at, used_at, created_at
                                FROM auth_tokens
                                WHERE token = $1 AND type = $2 
                                AND used_at IS NULL AND expires_at > NOW() LIMIT 1
                                )",
                             pqxx::params{token, type})};

        if (result.empty())
            return std::nullopt;

        return Model::MapAuthToken(result[0]);
    }

    void AuthRepository::MarkTokenUsed(PooledConnection& conn, i32 tokenId)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec(R"(
                                UPDATE auth_tokens
                                SET used_at = NOW()
                                WHERE id = $1
                                RETURNING id
                                )",
                             pqxx::params{tokenId})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to mark auth token as used");
    }

    void AuthRepository::UpdatePassword(PooledConnection& conn, i32 userId, const std::string& passwordHash)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec(R"(
                                UPDATE users
                                SET password_hash = $2
                                WHERE id = $1
                                RETURNING id
                                )",
                             pqxx::params{userId, passwordHash})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to update user password");

        m_UserCache.Invalidate(userId);
    }

    std::optional<Model::OAuthAccount> AuthRepository::FindOAuthAccount(
        PooledConnection& conn,
        const std::string& provider,
        const std::string& providerId)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec(R"(
                                SELECT id, user_id, provider, provider_id
                                FROM oauth_accounts
                                WHERE provider = $1 AND provider_id = $2 LIMIT 1
                                )",
                             pqxx::params{provider, providerId})};

        if (result.empty())
            return std::nullopt;

        return Model::MapOAuthAccount(result[0]);
    }

    Model::OAuthAccount AuthRepository::CreateOAuthAccount(
        PooledConnection& conn,
        i32 userId,
        const std::string& provider,
        const std::string& providerId)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec(R"(
                                INSERT INTO oauth_accounts(user_id, provider, provider_id)
                                VALUES($1, $2, $3)
                                RETURNING id, user_id, provider, provider_id
                                )",
                             pqxx::params{userId, provider, providerId})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to create oauth account");

        return Model::MapOAuthAccount(result[0]);
    }

    Model::User AuthRepository::CreateOAuthUser(
        PooledConnection& conn,
        const std::string& username,
        const std::string& avatarUrl)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec(R"(
                                INSERT INTO users(username, display_name, is_verified, avatar_url)
                                VALUES($1, $1, TRUE, $2)
                                RETURNING id, username, display_name, email, password_hash, is_verified, avatar_url,
                                aura, energy, last_energy_refill, current_streak, longest_streak, last_login_data, created_at
                                )",
                             pqxx::params{username, avatarUrl})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to create oauth user");

        auto user{Model::MapUser(result[0])};
        m_UserCache.Set(user);

        return user;
    }
} // namespace CLingo
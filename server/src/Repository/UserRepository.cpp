// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "UserRepository.hpp"

#include <Model/DatabaseToModelMapper.hpp>

namespace CLingo
{
    UserRepository::UserRepository(UserCache& userCache)
        : m_UserCache(userCache) {}

    std::optional<Model::User> UserRepository::FindById(PooledConnection& conn, i32 userId)
    {
        auto cached{m_UserCache.GetById(userId)};
        if (cached)
            return *cached;

        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                SELECT id, username, display_name, email, password_hash, is_verified, avatar_url,
                                aura, energy, last_energy_refill, current_streak, longest_streak, last_login_date, created_at
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

    bool UserRepository::UsernameExists(PooledConnection& conn, i32 userId, const std::string& username)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                    SELECT 1 FROM users
                                    WHERE username = $2 AND id != $1 LIMIT 1
                                    )",
                                    pqxx::params{userId, username})};

        return !result.empty();
    }

    void UserRepository::ClaimEnergy(PooledConnection& conn, i32 userId, i32 energy)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                UPDATE users
                                SET energy = $2, last_energy_refill = NOW()
                                WHERE id = $1
                                RETURNING id
                                )",
                                    pqxx::params{userId, energy})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to claim energy");
    }

    void UserRepository::EditProfile(PooledConnection& conn, i32 userId, const std::string& username, const std::string& displayName)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                UPDATE users
                                SET username = $2, display_name = $3
                                WHERE id = $1
                                RETURNING id
                                )",
                                    pqxx::params{userId, username, displayName})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to update user profile");

        m_UserCache.Invalidate(userId);
    }

} // namespace CLingo
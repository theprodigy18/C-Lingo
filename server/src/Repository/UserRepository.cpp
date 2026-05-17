// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "UserRepository.hpp"

#include <Model/DatabaseToModelMapper.hpp>

namespace CLingo
{
    UserRepository::UserRepository(UserCache& userCache, Cache<i32, std::vector<Model::User>>& leaderboardCache)
        : m_UserCache{userCache}, m_LeaderboardCache{leaderboardCache} {}

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

    void UserRepository::ClaimEnergy(PooledConnection& conn, i32 userId, i32 energy, i32 currentStreak, i32 longestStreak)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                UPDATE users
                                SET energy = $2,
                                    last_energy_refill = NOW(),
                                    current_streak = $3,
                                    longest_streak = $4
                                WHERE id = $1
                                RETURNING id
                                )",
                                    pqxx::params{userId, energy, currentStreak, longestStreak})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to claim energy");

        m_UserCache.Invalidate(userId);
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

    void UserRepository::UpdateLastLoginDate(PooledConnection& conn, i32 userId)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                    UPDATE users
                                    SET last_login_date = NOW()
                                    WHERE id = $1
                                    RETURNING id
                                    )",
                                    pqxx::params{userId})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to update last login date");

        m_UserCache.Invalidate(userId);
    }

    void UserRepository::ResetStreak(PooledConnection& conn, i32 userId)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                UPDATE users
                                SET current_streak = 0
                                WHERE id = $1
                                RETURNING id
                                )",
                                    pqxx::params{userId})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to reset streak");

        m_UserCache.Invalidate(userId);
    }

    std::vector<Model::User> UserRepository::FindTopByAura(PooledConnection& conn, i32 limit)
    {
        auto cached{m_LeaderboardCache.Get(limit)};
        if (cached)
            return *cached;

        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                            SELECT id, username, display_name, email, password_hash, is_verified, avatar_url,
                            aura, energy, last_energy_refill, current_streak, longest_streak, last_login_date, created_at
                            FROM users
                            WHERE aura > 0
                            ORDER BY aura DESC
                            LIMIT $1
                            )",
                                    pqxx::params{limit})};

        std::vector<Model::User> users;
        users.reserve(result.size());

        for (const auto& row : result)
        {
            users.push_back(Model::MapUser(row));
        }

        m_LeaderboardCache.Set(limit, users);

        return users;
    }

    std::optional<i32> UserRepository::FindUserRank(PooledConnection& conn, i32 userId)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                            SELECT aura FROM users WHERE id = $1
                            )",
                                    pqxx::params{userId})};

        if (result.empty())
            return std::nullopt;

        auto userAura{result[0]["aura"].as<i32>()};

        auto rankResult{txn.exec_params(R"(
                            SELECT COUNT(*) as rank FROM users WHERE aura > $1
                            )",
                                    pqxx::params{userAura})};

        auto rank{rankResult[0]["rank"].as<i32>() + 1};

        return rank;
    }

    void UserRepository::DeductEnergy(PooledConnection& conn, i32 userId, i32 energyCost)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                UPDATE users
                                SET energy = energy - $2
                                WHERE id = $1
                                RETURNING id
                                )",
                                    pqxx::params{userId, energyCost})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to deduct energy");

        m_UserCache.Invalidate(userId);
    }

    void UserRepository::AddAura(PooledConnection& conn, i32 userId, i32 aura)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                UPDATE users
                                SET aura = aura + $2
                                WHERE id = $1
                                RETURNING id
                                )",
                                    pqxx::params{userId, aura})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to add aura");

        m_UserCache.Invalidate(userId);
    }
} // namespace CLingo
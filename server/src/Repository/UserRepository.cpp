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
} // namespace CLingo
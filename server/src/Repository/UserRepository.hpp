// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Core/UserCache.hpp>
#include <Util/Cache.hpp>
#include <Database/PooledConnection.hpp>
#include <Model/User.hpp>

namespace CLingo
{
    class UserRepository
    {
    public:
        UserRepository(UserCache& userCache, Cache<i32, std::vector<Model::User>>& leaderboardCache);

        std::optional<Model::User> FindById(PooledConnection& conn, i32 userId);
        bool UsernameExists(PooledConnection& conn, i32 userId, const std::string& username);
        void ClaimEnergy(PooledConnection& conn, i32 userId, i32 energy, i32 currentStreak, i32 longestStreak);
        void ResetStreak(PooledConnection& conn, i32 userId);
        void EditProfile(PooledConnection& conn, i32 userId, const std::string& username, const std::string& displayName);
        void UpdateLastLoginDate(PooledConnection& conn, i32 userId);
        std::vector<Model::User> FindTopByAura(PooledConnection& conn, i32 limit);
        std::optional<i32> FindUserRank(PooledConnection& conn, i32 userId);
        void DeductEnergy(PooledConnection& conn, i32 userId, i32 energyCost);
        void AddAura(PooledConnection& conn, i32 userId, i32 aura);

    private:
        UserCache& m_UserCache;
        Cache<i32, std::vector<Model::User>>& m_LeaderboardCache;
    };
} // namespace CLingo
// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <pqxx/pqxx>

#include "User.hpp"
#include "AuthToken.hpp"
#include "OAuthAccount.hpp"
#include "EnergyLog.hpp"
#include "Level.hpp"

namespace CLingo::Model
{
    namespace
    {
        // Convert tm to time_t treating tm as UTC (not local time)
        // Windows uses _mkgmtime, POSIX uses timegm
        inline std::time_t UtcToTimeT(std::tm& tm)
        {
#ifdef _WIN64
            return _mkgmtime(&tm);
#else
            return ::timegm(&tm);
#endif
        }
    } // anonymous namespace

    inline User MapUser(const pqxx::row& row)
    {
        std::string timestampStr{row["last_energy_refill"].as<std::string>()};

        std::tm tm{};
        std::istringstream ss{timestampStr};
        ss >> std::get_time(&tm, "%Y-%m-%d %H:%M:%S");

        // PostgreSQL TIMESTAMPTZ is stored as UTC.
        // std::mktime interprets tm as local time, causing offset on non-UTC systems.
        // Use UtcToTimeT to correctly parse UTC timestamps.
        tm.tm_isdst = 0;
        auto timePoint{std::chrono::system_clock::from_time_t(UtcToTimeT(tm))};

        return User{
            row["id"].as<i32>(),
            row["username"].as<std::string>(),
            row["display_name"].as<std::string>(),
            row["email"].is_null() ? "" : row["email"].as<std::string>(),
            row["password_hash"].is_null() ? "" : row["password_hash"].as<std::string>(),
            row["is_verified"].as<bool>(),
            row["avatar_url"].is_null() ? "" : row["avatar_url"].as<std::string>(),
            row["aura"].as<i32>(),
            row["energy"].as<i32>(),
            timePoint,
            row["current_streak"].as<i32>(),
            row["longest_streak"].as<i32>(),
            row["last_login_date"].is_null() ? "" : row["last_login_date"].as<std::string>(),
            row["created_at"].as<std::string>()};
    }

    inline AuthToken MapAuthToken(const pqxx::row& row)
    {
        return AuthToken{
            row["id"].as<i32>(),
            row["user_id"].as<i32>(),
            row["token"].as<std::string>(),
            row["type"].as<std::string>(),
            row["expires_at"].as<std::string>(),
            row["used_at"].is_null() ? "" : row["used_at"].as<std::string>(),
            row["created_at"].as<std::string>()};
    }

    inline OAuthAccount MapOAuthAccount(const pqxx::row& row)
    {
        return OAuthAccount{
            row["id"].as<i32>(),
            row["user_id"].as<i32>(),
            row["provider"].as<std::string>(),
            row["provider_id"].as<std::string>()};
    }

    inline Level MapLevel(const pqxx::row& row)
    {
        return Level{
            row["id"].as<i32>(),
            row["level_number"].as<i32>(),
            row["title"].as<std::string>(),
            row["content_md"].as<std::string>(),
            row["energy_cost"].as<i32>(),
            row["quiz_aura_reward"].as<i32>(),
            row["is_published"].as<bool>()};
    }

    inline std::vector<Level> MapLevels(const pqxx::result& result)
    {
        std::vector<Level> levels;
        levels.reserve(result.size());

        for (const auto& row : result)
        {
            levels.emplace_back(MapLevel(row));
        }

        return levels;
    }

    inline EnergyLog MapEnergyLog(const pqxx::row& row)
    {
        return EnergyLog{
            row["id"].as<i32>(),
            row["user_id"].as<i32>(),
            row["delta"].as<i32>(),
            row["reason"].as<std::string>(),
            row["created_at"].as<std::string>()};
    }

    inline std::vector<EnergyLog> MapEnergyLogs(const pqxx::result& result)
    {
        std::vector<EnergyLog> energyLogs;
        energyLogs.reserve(result.size());

        for (const auto& row : result)
        {
            energyLogs.emplace_back(MapEnergyLog(row));
        }

        return energyLogs;
    }
} // namespace CLingo::Model
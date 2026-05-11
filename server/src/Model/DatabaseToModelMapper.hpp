// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <pqxx/pqxx>

#include <Model/User.hpp>
#include <Model/AuthToken.hpp>
#include <Model/OAuthAccount.hpp>

namespace CLingo::Model
{
    inline User MapUser(const pqxx::row& row)
    {
        std::string timestampStr{row["last_energy_refill"].as<std::string>()};

        std::tm tm{};
        std::istringstream ss(timestampStr);
        ss >> std::get_time(&tm, "%Y-%m-%d %H:%M:%S");
        auto timePoint{std::chrono::system_clock::from_time_t(std::mktime(&tm))};

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
} // namespace CLingo::Model
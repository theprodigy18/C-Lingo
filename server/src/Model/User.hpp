// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Model
{
    struct User
    {
        i32 id;
        std::string username;
        std::string displayName;
        std::string email;
        std::string passwordHash;
        bool isVerified;
        std::string avatarUrl;
        i32 aura;
        i32 energy;
        std::chrono::system_clock::time_point lastEnergyRefill;
        i32 currentStreak;
        i32 longestStreak;
        std::string lastLoginDate;
        std::string createdAt;
    };
} // namespace CLingo::Model
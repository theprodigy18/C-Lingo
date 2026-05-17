// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Model
{
    // Leaderboard entry dengan category untuk pisahkan runtime vs memory
    struct LeaderboardEntryWithCategory
    {
        i32 userId;
        std::string username;
        std::string displayName;
        f64 value;      // runtime_ms atau memory_kb tergantung category
        std::string submittedAt;
        std::string category;  // "runtime" atau "memory"
    };
} // namespace CLingo::Model
// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct LeaderboardEntry
    {
        i32 rank;
        i32 userId;
        std::string username;
        std::string displayName;
        i32 value;
        std::string submittedAt;
    };

    struct LeaderboardResponse
    {
        i32 userRank;
        i32 userValue;
        std::vector<LeaderboardEntry> entries;
    };
} // namespace CLingo::Dto

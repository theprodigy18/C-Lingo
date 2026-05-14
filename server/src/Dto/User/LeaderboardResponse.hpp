// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct LeaderboardEntry
    {
        i32 rank;
        std::string username;
        std::string displayName;
        i32 aura;
        std::string avatarUrl;
    };

    struct LeaderboardResponse
    {
        i32 userRank;
        std::vector<LeaderboardEntry> entries;
    };
} // namespace CLingo::Dto
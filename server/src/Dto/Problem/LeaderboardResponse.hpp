// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    // Problem-specific leaderboard entry
    struct ProblemLeaderboardEntry
    {
        i32 rank;
        i32 userId;
        std::string username;
        std::string displayName;
        f64 runtimeMs;
        f64 memoryKb;
        std::string submittedAt;
    };

    struct ProblemLeaderboardResponse
    {
        // Runtime leaderboard
        i32 userRankRuntime;
        f64 userRuntimeMs;
        std::vector<ProblemLeaderboardEntry> runtimeEntries;

        // Memory leaderboard
        i32 userRankMemory;
        f64 userMemoryKb;
        std::vector<ProblemLeaderboardEntry> memoryEntries;
    };
} // namespace CLingo::Dto

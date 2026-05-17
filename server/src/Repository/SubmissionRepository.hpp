// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Database/PooledConnection.hpp>
#include <Model/Submission.hpp>
#include <Model/LeaderboardEntryWithCategory.hpp>

namespace CLingo
{
    class SubmissionRepository
    {
    public:
        i32 Create(PooledConnection& conn, i32 userId, i32 problemId, const std::string& code);
        std::vector<Model::Submission> FindByUserAndProblem(PooledConnection& conn, i32 userId, i32 problemId);
        std::vector<Model::Submission> FindByProblem(PooledConnection& conn, i32 problemId);

        // Get best submission per user per category for leaderboard
        std::vector<Model::LeaderboardEntryWithCategory> FindLeaderboardByProblem(PooledConnection& conn, i32 problemId, i32 limit);
    };
} // namespace CLingo

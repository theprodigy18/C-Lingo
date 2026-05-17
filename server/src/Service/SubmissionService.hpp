// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Database/PooledConnection.hpp>
#include <Repository/SubmissionRepository.hpp>
#include <Repository/ProblemRepository.hpp>
#include <Repository/UserRepository.hpp>
#include <Repository/EnergyLogRepository.hpp>
#include <Repository/AuraLogRepository.hpp>
#include <Dto/Problem/SubmissionListResponse.hpp>
#include <Dto/Problem/LeaderboardResponse.hpp>

namespace CLingo
{
    class SubmissionService
    {
    public:
        SubmissionService(
            SubmissionRepository& submissionRepository,
            ProblemRepository& problemRepository,
            UserRepository& userRepository,
            EnergyLogRepository& energyLogRepository,
            AuraLogRepository& auraLogRepository);

        i32 CreateSubmission(PooledConnection& conn, i32 userId, i32 problemId, const std::string& code);
        Dto::SubmissionListResponse GetSubmissions(PooledConnection& conn, i32 userId, i32 problemId);
        Dto::ProblemLeaderboardResponse GetProblemLeaderboard(PooledConnection& conn, i32 userId, i32 problemId, i32 limit = 10);

    private:
        SubmissionRepository& m_SubmissionRepo;
        ProblemRepository& m_ProblemRepo;
        UserRepository& m_UserRepo;
        EnergyLogRepository& m_EnergyLogRepo;
        AuraLogRepository& m_AuraLogRepo;
    };
} // namespace CLingo

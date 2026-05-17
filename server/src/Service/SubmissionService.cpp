// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "SubmissionService.hpp"

#include <Repository/ProblemRepository.hpp>
#include <Repository/UserRepository.hpp>
#include <Repository/EnergyLogRepository.hpp>
#include <Repository/AuraLogRepository.hpp>
#include <Dto/ModelToDtoParser.hpp>

namespace CLingo
{
    SubmissionService::SubmissionService(
        SubmissionRepository& submissionRepository,
        ProblemRepository& problemRepository,
        UserRepository& userRepository,
        EnergyLogRepository& energyLogRepository,
        AuraLogRepository& auraLogRepository)
        : m_SubmissionRepo{submissionRepository}
        , m_ProblemRepo{problemRepository}
        , m_UserRepo{userRepository}
        , m_EnergyLogRepo{energyLogRepository}
        , m_AuraLogRepo{auraLogRepository} {}

    i32 SubmissionService::CreateSubmission(PooledConnection& conn, i32 userId, i32 problemId, const std::string& code)
    {
        // Get problem energy cost
        auto problem = m_ProblemRepo.FindById(conn, problemId);
        if (!problem)
            throw NotFoundError("Problem not found");

        i32 energyCost = problem->energyCost;

        // Check and deduct energy
        auto user = m_UserRepo.FindById(conn, userId);
        if (!user)
            throw NotFoundError("User not found");

        if (user->energy < energyCost)
            throw BadRequestError("Not enough energy");

        // Deduct energy
        m_UserRepo.DeductEnergy(conn, userId, energyCost);

        // Log energy deduction
        m_EnergyLogRepo.AddEnergyLog(conn, userId, -energyCost, "Coding practice: problem " + std::to_string(problemId));

        // Create submission
        return m_SubmissionRepo.Create(conn, userId, problemId, code);
    }

    Dto::SubmissionListResponse SubmissionService::GetSubmissions(PooledConnection& conn, i32 userId, i32 problemId)
    {
        auto submissions = m_SubmissionRepo.FindByUserAndProblem(conn, userId, problemId);

        // Get problem aura reward
        auto problem = m_ProblemRepo.FindById(conn, problemId);
        i32 auraReward = problem ? problem->auraReward : 0;

        // Check if there are accepted submissions
        bool hasAcceptedSubmission = false;
        for (const auto& sub : submissions)
        {
            if (sub.status == "accepted")
            {
                hasAcceptedSubmission = true;
                break;
            }
        }

        // Give aura only once: user has accepted submission AND hasn't received reward for this problem yet
        bool auraJustEarned = false;
        if (hasAcceptedSubmission && auraReward > 0)
        {
            bool alreadyGotReward = m_AuraLogRepo.HasRewardForRef(conn, userId, problemId, "problem");
            if (!alreadyGotReward)
            {
                m_UserRepo.AddAura(conn, userId, auraReward);
                m_AuraLogRepo.AddAuraLog(conn, userId, auraReward, "First accepted: problem " + std::to_string(problemId), problemId, "problem");
                auraJustEarned = true;
            }
        }

        // Build submission items (no per-item aura flag needed)
        std::vector<Dto::SubmissionItem> items;
        for (const auto& sub : submissions)
        {
            items.push_back({
                sub.id,
                sub.status,
                sub.runtimeMs,
                sub.memoryKb,
                sub.errorOutput,
                sub.submittedAt
            });
        }

        return Dto::SubmissionListResponse{std::move(items), auraJustEarned};
    }

    Dto::ProblemLeaderboardResponse SubmissionService::GetProblemLeaderboard(PooledConnection& conn, i32 userId, i32 problemId, i32 limit)
    {
        // Get all leaderboard entries from repository
        auto entries = m_SubmissionRepo.FindLeaderboardByProblem(conn, problemId, limit);

        // Separate into runtime and memory entries
        std::vector<Dto::ProblemLeaderboardEntry> runtimeEntries;
        std::vector<Dto::ProblemLeaderboardEntry> memoryEntries;
        runtimeEntries.reserve(entries.size());
        memoryEntries.reserve(entries.size());

        for (const auto& entry : entries)
        {
            if (entry.category == "runtime")
            {
                runtimeEntries.push_back({
                    0,  // rank will be assigned later
                    entry.userId,
                    entry.username,
                    entry.displayName,
                    entry.value,  // this is runtime_ms
                    0.0,         // not used for runtime leaderboard
                    entry.submittedAt
                });
            }
            else if (entry.category == "memory")
            {
                memoryEntries.push_back({
                    0,  // rank will be assigned later
                    entry.userId,
                    entry.username,
                    entry.displayName,
                    0.0,         // not used for memory leaderboard
                    entry.value,  // this is memory_kb
                    entry.submittedAt
                });
            }
        }

        // Assign ranks to runtime entries
        for (uSize i{0}; i < runtimeEntries.size(); ++i)
        {
            runtimeEntries[i].rank = static_cast<i32>(i + 1);
        }

        // Assign ranks to memory entries
        for (uSize i{0}; i < memoryEntries.size(); ++i)
        {
            memoryEntries[i].rank = static_cast<i32>(i + 1);
        }

        // Find user's rank in each category
        i32 userRankRuntime = 0;
        f64 userRuntimeMs = 0.0;
        for (const auto& entry : runtimeEntries)
        {
            if (entry.userId == userId)
            {
                userRankRuntime = entry.rank;
                userRuntimeMs = entry.runtimeMs;
                break;
            }
        }

        i32 userRankMemory = 0;
        f64 userMemoryKb = 0.0;
        for (const auto& entry : memoryEntries)
        {
            if (entry.userId == userId)
            {
                userRankMemory = entry.rank;
                userMemoryKb = entry.memoryKb;
                break;
            }
        }

        return Dto::ProblemLeaderboardResponse{
            userRankRuntime,
            userRuntimeMs,
            std::move(runtimeEntries),
            userRankMemory,
            userMemoryKb,
            std::move(memoryEntries)
        };
    }
} // namespace CLingo

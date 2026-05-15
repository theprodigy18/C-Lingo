// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Model/User.hpp>
#include <Model/EnergyLog.hpp>
#include <Model/Problem.hpp>
#include <Model/Submission.hpp>
#include "User/SessionUser.hpp"
#include "User/UserState.hpp"
#include "User/PrivateUser.hpp"
#include "User/LeaderboardResponse.hpp"
#include "EnergyLog/EnergyLogResponse.hpp"
#include "Problem/ProblemListResponse.hpp"
#include "Problem/ProblemDetailResponse.hpp"
#include "Problem/SubmissionListResponse.hpp"

namespace CLingo::Dto
{
    inline SessionUser UserToSessionUser(const Model::User& user)
    {
        return SessionUser{
            user.id,
            user.username,
            user.displayName,
            user.avatarUrl,
        };
    }

    inline UserState UserToUserState(const Model::User& user)
    {
        const auto now{std::chrono::system_clock::now()};
        const auto nextRefill{user.lastEnergyRefill + std::chrono::hours(24)};

        bool canClaimDailyEnergy{now >= nextRefill};
        i32 nextEnergyRefillSeconds{0};
        if (!canClaimDailyEnergy)
        {
            nextEnergyRefillSeconds = static_cast<i32>(
                std::chrono::duration_cast<std::chrono::seconds>(nextRefill - now).count());
        }

        return UserState{
            user.aura,
            user.energy,
            user.currentStreak,
            user.longestStreak,
            canClaimDailyEnergy,
            nextEnergyRefillSeconds};
    }

    inline PrivateUser UserToPrivateUser(const Model::User& user)
    {
        return PrivateUser{
            user.username,
            user.displayName,
            user.email,
            user.avatarUrl,
            user.currentStreak,
            user.longestStreak,
        };
    }

    inline std::vector<EnergyLogResponse> EnergyLogsToEnergyLogResponses(const std::vector<Model::EnergyLog>& energyLogs)
    {
        std::vector<EnergyLogResponse> res;
        res.reserve(energyLogs.size());

        for (const auto& log : energyLogs)
        {
            res.emplace_back(EnergyLogResponse{
                log.delta,
                log.reason,
                log.createdAt});
        }

        return res;
    }

    inline LeaderboardEntry UserToLeaderboardEntry(i32 rank, const Model::User& user)
    {
        return LeaderboardEntry{
            rank,
            user.username,
            user.displayName,
            user.aura,
            user.avatarUrl,
        };
    }

    inline LeaderboardResponse UsersToLeaderboardResponse(i32 userRank, const std::vector<Model::User>& users)
    {
        std::vector<LeaderboardEntry> entries;
        entries.reserve(users.size());

        for (uSize i{0}; i < users.size(); ++i)
        {
            entries.push_back(UserToLeaderboardEntry(static_cast<i32>(i + 1), users[i]));
        }

        return LeaderboardResponse{userRank, std::move(entries)};
    }

#pragma region Problem
    inline ProblemListItem ProblemToListItem(const Model::Problem& problem)
    {
        return ProblemListItem{
            problem.id,
            problem.title,
            problem.slug,
            problem.difficulty,
            problem.energyCost,
            problem.auraReward,
            problem.tags,
        };
    }

    inline std::vector<ProblemListItem> ProblemsToListItems(const std::vector<Model::Problem>& problems)
    {
        std::vector<ProblemListItem> items;
        items.reserve(problems.size());
        for (const auto& problem : problems)
            items.push_back(ProblemToListItem(problem));
        return items;
    }

    inline TestCaseDto TestCaseToDto(const Model::TestCase& tc)
    {
        return TestCaseDto{
            tc.id,
            tc.input,
            tc.expectedOutput,
            tc.explanationMd,
            tc.isHidden,
            tc.orderIndex,
        };
    }

    inline std::vector<TestCaseDto> TestCasesToDtos(const std::vector<Model::TestCase>& testCases)
    {
        std::vector<TestCaseDto> dtos;
        dtos.reserve(testCases.size());
        for (const auto& tc : testCases)
            dtos.push_back(TestCaseToDto(tc));
        return dtos;
    }

    inline ProblemDetail ProblemToDetail(const Model::Problem& problem, const std::vector<Model::TestCase>& testCases)
    {
        return ProblemDetail{
            problem.id,
            problem.title,
            problem.slug,
            problem.descriptionMd,
            problem.constraintsMd,
            problem.starterCode,
            problem.tags,
            problem.difficulty,
            problem.energyCost,
            problem.auraReward,
            TestCasesToDtos(testCases),
        };
    }
#pragma endregion

#pragma region Submission
    inline SubmissionItem SubmissionToItem(const Model::Submission& sub)
    {
        return SubmissionItem{
            sub.id,
            sub.status,
            sub.runtimeMs,
            sub.memoryKb,
            sub.submittedAt,
        };
    }

    inline std::vector<SubmissionItem> SubmissionsToItems(const std::vector<Model::Submission>& submissions)
    {
        std::vector<SubmissionItem> items;
        items.reserve(submissions.size());
        for (const auto& sub : submissions)
            items.push_back(SubmissionToItem(sub));
        return items;
    }
#pragma endregion
} // namespace CLingo::Dto
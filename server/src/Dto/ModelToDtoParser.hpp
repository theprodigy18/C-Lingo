// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Model/User.hpp>
#include <Model/EnergyLog.hpp>
#include "User/SessionUser.hpp"
#include "User/UserState.hpp"
#include "User/PrivateUser.hpp"
#include "EnergyLog/EnergyLogResponse.hpp"

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
} // namespace CLingo::Dto
// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct UserState
    {
        i32 aura;
        i32 energy;
        i32 currentStreak;
        i32 longestStreak;
        bool canClaimDailyEnergy;
        i32 nextEnergyRefillSeconds;
    };
} // namespace CLingo::Dto
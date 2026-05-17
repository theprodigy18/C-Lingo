// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct LevelListItem
    {
        i32 id;
        i32 levelNumber;
        std::string title;
        i32 energyCost;
        i32 quizAuraReward;
        bool isUnlocked;
        bool isCompleted;
        bool isStarted;
    };

    struct LevelListResponse
    {
        std::vector<LevelListItem> levels;
    };
} // namespace CLingo::Dto
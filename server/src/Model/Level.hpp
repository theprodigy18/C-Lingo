// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Model
{
    struct Level
    {
        i32 id;
        i32 levelNumber;
        std::string title;
        std::string contentMd;
        i32 energyCost;
        i32 quizAuraReward;
        bool isPublished;
    };
} // namespace CLingo::Model
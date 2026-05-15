// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Model
{
    struct TestCase
    {
        i32 id;
        i32 problemId;
        std::string input;
        std::string expectedOutput;
        std::string explanationMd;
        bool isHidden;
        i32 orderIndex;
    };

    struct Problem
    {
        i32 id;
        std::string title;
        std::string slug;
        std::string descriptionMd;
        std::string constraintsMd;
        std::string starterCode;
        std::string tags;
        std::string difficulty;
        i32 energyCost;
        i32 auraReward;
        bool isPublished;
        std::string createdAt;
    };
} // namespace CLingo::Model

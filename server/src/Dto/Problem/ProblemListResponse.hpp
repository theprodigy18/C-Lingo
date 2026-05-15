// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct ProblemListItem
    {
        i32 id;
        std::string title;
        std::string slug;
        std::string difficulty;
        i32 energyCost;
        i32 auraReward;
        std::string tags;
    };

    struct ProblemListResponse
    {
        std::vector<ProblemListItem> problems;
    };
} // namespace CLingo::Dto

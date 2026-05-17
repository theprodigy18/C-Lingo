// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct TestCaseDto
    {
        i32 id;
        std::string inputUi;
        std::string input;
        std::string expectedOutput;
        std::string explanationMd;
        bool isHidden;
        i32 orderIndex;
    };

    struct ProblemDetail
    {
        i32 id;
        std::string title;
        std::string slug;
        std::string descriptionMd;
        std::string constraintsMd;
        std::string starterCode;
        std::string entryPoint;
        std::string tags;
        std::string difficulty;
        i32 energyCost;
        i32 auraReward;
        std::vector<TestCaseDto> testCases;
    };

    struct ProblemDetailResponse
    {
        ProblemDetail problem;
        bool hasProblem;
    };
} // namespace CLingo::Dto

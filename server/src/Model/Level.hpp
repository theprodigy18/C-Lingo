// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Model
{
    struct QuizOption
    {
        i32 id;
        i32 questionId;
        std::string optionText;
        bool isCorrect;
    };

    struct QuizQuestion
    {
        i32 id;
        i32 levelId;
        std::string questionText;
        std::string explanation;
        i32 orderIndex;
        std::vector<QuizOption> options;
    };

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

    struct UserLevelProgress
    {
        bool isUnlocked;
        bool isCompleted;
        i32 quizScore;
        i32 attempts;
        std::string completedAt;
    };
} // namespace CLingo::Model
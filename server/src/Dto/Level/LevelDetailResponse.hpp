// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Model/Level.hpp>

namespace CLingo::Dto
{
    struct QuizOption
    {
        i32 id;
        std::string optionText;
        bool isCorrect;
    };

    struct QuizQuestion
    {
        i32 id;
        std::string questionText;
        std::string explanation;
        i32 orderIndex;
        std::vector<QuizOption> options;
    };

    struct LevelDetail
    {
        i32 id;
        i32 levelNumber;
        std::string title;
        std::string contentMd;
        i32 energyCost;
        i32 quizAuraReward;
        bool isPublished;
        bool isUnlocked;
        bool isCompleted;
        i32 quizScore;
        i32 attempts;
        std::string completedAt;
        std::vector<Model::QuizQuestion> questions;
    };

    struct LevelDetailResponse
    {
        LevelDetail level;
        bool hasLevel;
    };
} // namespace CLingo::Dto
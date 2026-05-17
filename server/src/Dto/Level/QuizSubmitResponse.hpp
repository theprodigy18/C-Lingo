// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct QuizQuestionResult
    {
        i32 questionId;
        std::string questionText;
        i32 selectedOptionId;
        std::string selectedOptionText;
        i32 correctOptionId;
        std::string correctOptionText;
        bool isCorrect;
        std::string explanation;
    };

    struct QuizSubmitResponse
    {
        i32 score;
        i32 total;
        i32 correct;
        bool passed;
        bool isCompleted;
        bool isNewCompletion;
        std::vector<QuizQuestionResult> results;
    };
} // namespace CLingo::Dto

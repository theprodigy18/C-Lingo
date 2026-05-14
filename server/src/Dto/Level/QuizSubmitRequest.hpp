// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <unordered_map>

namespace CLingo::Dto
{
    // question_id -> option_id
    struct QuizSubmitRequest
    {
        i32 levelId;
        std::unordered_map<i32, i32> answers;
    };
} // namespace CLingo::Dto

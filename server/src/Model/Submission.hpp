// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Model
{
    struct Submission
    {
        i32 id;
        i32 userId;
        i32 problemId;
        std::string code;
        std::string status;
        f64 runtimeMs;      // milliseconds (float, e.g., 0.5)
        f64 memoryKb;       // kilobytes (float, e.g., 2560.5)
        std::string errorOutput;
        std::string submittedAt;
    };
} // namespace CLingo::Model

// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct SubmissionItem
    {
        i32 id;
        std::string status;
        f64 runtimeMs;      // milliseconds (float)
        f64 memoryKb;       // kilobytes (float)
        std::string errorOutput;
        std::string submittedAt;
    };

    struct SubmissionListResponse
    {
        std::vector<SubmissionItem> submissions;
        bool auraJustEarned;  // true if user just earned aura in this fetch (for showing notification)
    };
} // namespace CLingo::Dto

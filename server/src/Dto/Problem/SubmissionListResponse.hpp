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
        i32 runtimeMs;
        i32 memoryKb;
        std::string submittedAt;
    };

    struct SubmissionListResponse
    {
        std::vector<SubmissionItem> submissions;
    };
} // namespace CLingo::Dto

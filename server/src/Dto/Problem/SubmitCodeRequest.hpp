// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct SubmitCodeRequest
    {
        i32 problemId;
        std::string code;
    };

    struct SubmitCodeResponse
    {
        i32 submissionId;
        std::string status;
    };
} // namespace CLingo::Dto

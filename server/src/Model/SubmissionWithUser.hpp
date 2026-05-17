// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Model
{
    // View model dari query join submissions + users
    // Bukan 1:1 dengan tabel, tapi hasil join yang reusable
    struct SubmissionWithUser
    {
        i32 userId;
        std::string username;
        std::string displayName;
        f64 runtimeMs;
        f64 memoryKb;
        std::string submittedAt;
    };
} // namespace CLingo::Model
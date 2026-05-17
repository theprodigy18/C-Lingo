// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct VerifyEmailRequest
    {
        std::string email;
        std::string otp;
    };
} // namespace CLingo::Dto
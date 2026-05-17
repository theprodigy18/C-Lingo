// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct ForgotPasswordRequest
    {
        std::string email;
    };
} // namespace CLingo::Dto
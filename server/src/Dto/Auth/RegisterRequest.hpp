// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct RegisterRequest
    {
        std::string username;
        std::string email;
        std::string password;
    };
} // namespace CLingo::Dto
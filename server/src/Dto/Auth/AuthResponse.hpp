// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Model/User.hpp>
#include <Dto/User/SessionUser.hpp>

namespace CLingo::Dto
{
    struct AuthResponse
    {
        std::string token;
        SessionUser user;
    };
} // namespace CLingo::Dto
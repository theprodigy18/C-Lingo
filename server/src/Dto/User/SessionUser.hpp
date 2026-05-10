// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct SessionUser
    {
        i32 id;
        std::string username;
        std::string displayName;
        std::string avatarUrl;
    };
} // namespace CLingo::Dto
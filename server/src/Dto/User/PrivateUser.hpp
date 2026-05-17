// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct PrivateUser
    {
        std::string username;
        std::string displayName;
        std::string email;
        std::string avatarUrl;
        i32 currentStreak;
        i32 longestStreak;
    };
} // namespace CLingo::Dto
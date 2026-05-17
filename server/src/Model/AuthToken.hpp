// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Model
{
    struct AuthToken
    {
        i32 id;
        i32 userId;
        std::string token;
        std::string type;
        std::string expiresAt;
        std::string usedAt;
        std::string createdAt;
    };
} // namespace CLingo::Model
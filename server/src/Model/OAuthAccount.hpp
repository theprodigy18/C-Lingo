// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Model
{
    struct OAuthAccount
    {
        i32 id;
        i32 userId;
        std::string provider;
        std::string providerId;
    };
} // namespace CLingo::Model
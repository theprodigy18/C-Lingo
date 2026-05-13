// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Model
{
    struct EnergyLog
    {
        i32 id;
        i32 userId;
        i32 delta;
        std::string reason;
        std::string createdAt;
    };
} // namespace CLingo::Model
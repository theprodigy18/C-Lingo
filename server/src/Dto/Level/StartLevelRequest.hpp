// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct StartLevelRequest
    {
        i32 levelId;
    };

    struct StartLevelResponse
    {
        bool success;
        std::string message;
        i32 remainingEnergy;
    };
} // namespace CLingo::Dto
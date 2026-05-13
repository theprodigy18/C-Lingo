// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo::Dto
{
    struct EditProfileRequest
    {
        std::string username;
        std::string displayName;
    };
} // namespace CLingo::Dto
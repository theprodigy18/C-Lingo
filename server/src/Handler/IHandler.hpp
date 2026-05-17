// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Common/App.hpp>

namespace CLingo
{
    class IHandler
    {
    public:
        virtual ~IHandler() = default;

        virtual void RegisterRoutes(App& app) = 0;
    };
} // namespace CLingo
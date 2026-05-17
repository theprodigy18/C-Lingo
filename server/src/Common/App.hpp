// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <crow/crow_all.h>

#include <Middleware/AuthMiddleware.hpp>

namespace CLingo
{
    using App = crow::App<crow::CORSHandler, AuthMiddleware>;
} // namespace CLingo
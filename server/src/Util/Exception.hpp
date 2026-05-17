// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Types.hpp>

#include <stdexcept>

namespace CLingo
{
    struct AppError : public std::runtime_error
    {
        u32 statusCode;

        AppError(u32 code, const std::string& message)
            : std::runtime_error(message.c_str()), statusCode(code) {}
    };

    struct BadRequestError : public AppError
    {
        explicit BadRequestError(const std::string& message)
            : AppError(400, message) {}
    };

    struct UnauthorizedError : public AppError
    {
        explicit UnauthorizedError(const std::string& message)
            : AppError(401, message) {}
    };

    struct ForbiddenError : AppError
    {
        explicit ForbiddenError(const std::string& message)
            : AppError(403, message) {}
    };

    struct NotFoundError : AppError
    {
        explicit NotFoundError(const std::string& message)
            : AppError(404, message) {}
    };

    struct ConflictError : AppError
    {
        explicit ConflictError(const std::string& message)
            : AppError(409, message) {}
    };

    struct InternalError : AppError
    {
        explicit InternalError(const std::string& message)
            : AppError(500, message) {}
    };
} // namespace CLingo
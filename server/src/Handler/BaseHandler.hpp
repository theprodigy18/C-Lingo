// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include "IHandler.hpp"
#include <Database/ConnectionPool.hpp>
#include <Database/PooledConnection.hpp>
#include <Core/CounterCache.hpp>

namespace CLingo
{
    class BaseHandler : public IHandler
    {
    public:
        explicit BaseHandler(std::string basePath);

    protected:
        // Response helpers

        // Returns a generic success response (HTTP 200)
        static crow::response Ok();

        // Returns a success response with JSON payload (HTTP 200)
        static crow::response Ok(crow::json::wvalue data);

        // Returns an error response with custom status code and message
        static crow::response Error(int code, std::string message);

        // Returns a 400 Bad Request response
        static crow::response BadRequest(std::string message);

        // Returns a 404 Not Found response
        static crow::response NotFound(std::string message);

        // Request helpers

        // Parses JSON body from request, returns empty optional if parsing fails
        static std::optional<crow::json::rvalue> ParseJson(const crow::request& req);

        // Database helpers

        static crow::response WithConnection(
            ConnectionPool& pool,
            std::function<crow::response(PooledConnection&)> handler);

        // Rate limit helpers

        static std::optional<crow::response> CheckRateLimit(
            CounterCache& cache,
            const std::string& key,
            i32 limit,
            std::chrono::seconds window);

    protected:
        std::string m_BasePath;
    };
} // namespace CLingo
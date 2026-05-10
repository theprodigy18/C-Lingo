// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Util/Jwt.hpp>

#include <crow/crow_all.h>

namespace CLingo
{
    struct AuthMiddleware
    {
        struct context
        {
            int userId = 0;
            bool authenticated = false;
        };

        std::string jwtSecret;
        std::string jwtIssuer;

        void AddPublicPrefix(const std::string& prefix)
        {
            m_PublicPrefixes.push_back(prefix);
        }

        void before_handle(crow::request& req, crow::response& res, context& ctx)
        {
            // Skip OPTIONS requests (CORS preflight)
            if (req.method == crow::HTTPMethod::Options)
                return;

            // Skip authentication for public routes
            for (const auto& prefix : m_PublicPrefixes)
            {
                if (req.url.find(prefix) == 0)
                    return;
            }

            // Extract Authorization header (expected: "Bearer <token>")
            auto authHeader = req.get_header_value("Authorization");
            if (authHeader.empty() || authHeader.substr(0, 7) != "Bearer ")
            {
                res = crow::response(crow::UNAUTHORIZED);
                res.end();
                return;
            }

            auto token = authHeader.substr(7);
            auto userId = Jwt::Verify(token, jwtSecret, jwtIssuer);

            // Reject invalid or expired tokens
            if (!userId)
            {
                res = crow::response(crow::UNAUTHORIZED);
                res.end();
                return;
            }

            // Populate request context on successful authentication
            ctx.userId = *userId;
            ctx.authenticated = true;
        }

        void after_handle(crow::request& req, crow::response& res, context& ctx) {}

    private:
        std::vector<std::string> m_PublicPrefixes;
    };
} // namespace CLingo
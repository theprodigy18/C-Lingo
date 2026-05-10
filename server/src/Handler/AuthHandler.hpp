// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include "BaseHandler.hpp"
#include <Service/AuthService.hpp>

namespace CLingo
{
    class AuthHandler : public BaseHandler
    {
    public:
        AuthHandler(
            std::string basePath,
            AuthService& authService,
            CounterCache& rateLimitCache,
            ConnectionPool& pool,
            const std::string& appUrl);

        void RegisterRoutes(App& app) override;

    private:
        crow::response HandleRegister(const crow::request& req);
        crow::response HandleLogin(const crow::request& req);
        crow::response HandleVerifyEmail(const crow::request& req);
        crow::response HandleForgotPassword(const crow::request& req);
        crow::response HandleResetPassword(const crow::request& req);
        crow::response HandleOAuthRedirect(const crow::request& req, const std::string& provider);
        crow::response HandleOAuthCallback(const crow::request& req, const std::string& provider);

    private:
        AuthService& m_AuthService;
        ConnectionPool& m_Pool;
        CounterCache& m_RateLimitCache;
        const std::string& m_AppUrl;
    };
} // namespace CLingo
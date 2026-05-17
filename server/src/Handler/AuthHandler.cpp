// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "AuthHandler.hpp"

#include <Dto/CrowParser.hpp>

namespace CLingo
{
    AuthHandler::AuthHandler(
        std::string basePath,
        AuthService& authService,
        CounterCache& rateLimitCache,
        ConnectionPool& pool,
        const std::string& appUrl)
        : BaseHandler{basePath}, m_AuthService{authService}, m_RateLimitCache{rateLimitCache}, m_Pool{pool}, m_AppUrl{appUrl} {}

    void AuthHandler::RegisterRoutes(App& app)
    {
        auto& auth{app.get_middleware<AuthMiddleware>()};
        auth.AddPublicPrefix(m_BasePath);

        app.route_dynamic(m_BasePath + "/register")
            .methods(crow::HTTPMethod::Post)(
                [this](const crow::request& req) {
                    return HandleRegister(req);
                });

        app.route_dynamic(m_BasePath + "/login")
            .methods(crow::HTTPMethod::Post)(
                [this](const crow::request& req) {
                    return HandleLogin(req);
                });

        app.route_dynamic(m_BasePath + "/verify-email")
            .methods(crow::HTTPMethod::Post)(
                [this](const crow::request& req) {
                    return HandleVerifyEmail(req);
                });

        app.route_dynamic(m_BasePath + "/forgot-password")
            .methods(crow::HTTPMethod::Post)(
                [this](const crow::request& req) {
                    return HandleForgotPassword(req);
                });

        app.route_dynamic(m_BasePath + "/reset-password")
            .methods(crow::HTTPMethod::Post)(
                [this](const crow::request& req) {
                    return HandleResetPassword(req);
                });

        app.route_dynamic(m_BasePath + "/resend-verification-email")
            .methods(crow::HTTPMethod::Post)(
                [this](const crow::request& req) {
                    return HandleResendVerificationEmail(req);
                });

        // OAuth - redirect to provider
        app.route_dynamic(m_BasePath + "/<string>")
            .methods(crow::HTTPMethod::Get)(
                [this](const crow::request& req, std::string provider) {
                    return HandleOAuthRedirect(req, provider);
                });

        // OAuth - callback from provider
        app.route_dynamic(m_BasePath + "/<string>/callback")
            .methods(crow::HTTPMethod::Get)(
                [this](const crow::request& req, std::string provider) {
                    return HandleOAuthCallback(req, provider);
                });

        // Session user - get user data from token
        app.route_dynamic(m_BasePath + "/session-user")
            .methods(crow::HTTPMethod::Post)(
                [this](const crow::request& req) {
                    return HandleGetSessionUser(req);
                });
    }

    // ─── Handlers ─────────────────────────────────────────────────────────────

    crow::response AuthHandler::HandleRegister(const crow::request& req)
    {
        if (auto limited{
                CheckRateLimit(
                    m_RateLimitCache,
                    "register:ip:" + req.remote_ip_address,
                    5,
                    std::chrono::hours(1))})
            return std::move(*limited);

        auto body{ParseJson(req)};
        if (!body)
            return BadRequest("Invalid JSON");

        auto dto{Dto::JsonToRegisterRequest(*body)};
        if (!dto)
            return BadRequest("Username, email, and password are required");

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            m_AuthService.Register(conn, *dto);
            return Ok();
        });
    }

    crow::response AuthHandler::HandleLogin(const crow::request& req)
    {
        if (auto limited{
                CheckRateLimit(
                    m_RateLimitCache,
                    "login:ip:" + req.remote_ip_address,
                    10,
                    std::chrono::minutes(15))})
            return std::move(*limited);

        auto body{ParseJson(req)};
        if (!body)
            return BadRequest("Invalid JSON");

        auto dto{Dto::JsonToLoginRequest(*body)};
        if (!dto)
            return BadRequest("Email and password are required");

        if (auto limited{
                CheckRateLimit(
                    m_RateLimitCache,
                    "login:email:" + dto->email,
                    5,
                    std::chrono::minutes(15))})
            return std::move(*limited);

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto res{m_AuthService.Login(conn, *dto)};
            return Ok(Dto::AuthResponseToJson(res));
        });
    }

    crow::response AuthHandler::HandleVerifyEmail(const crow::request& req)
    {
        if (auto limited{
                CheckRateLimit(
                    m_RateLimitCache,
                    "verify:ip:" + req.remote_ip_address,
                    5,
                    std::chrono::minutes(15))})
            return std::move(*limited);

        auto body{ParseJson(req)};
        if (!body)
            return BadRequest("Invalid JSON");

        auto dto{Dto::JsonToVerifyEmailRequest(*body)};
        if (!dto)
            return BadRequest("Email and OTP are required");

        if (auto limited{
                CheckRateLimit(
                    m_RateLimitCache,
                    "verify:email:" + dto->email,
                    5,
                    std::chrono::minutes(15))})
            return std::move(*limited);

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto res{m_AuthService.VerifyEmail(conn, *dto)};
            return Ok(Dto::AuthResponseToJson(res));
        });
    }

    crow::response AuthHandler::HandleForgotPassword(const crow::request& req)
    {
        if (auto limited{
                CheckRateLimit(
                    m_RateLimitCache,
                    "forgot:ip:" + req.remote_ip_address,
                    3,
                    std::chrono::minutes(1))})
            return std::move(*limited);

        auto body{ParseJson(req)};
        if (!body)
            return BadRequest("Invalid JSON");

        auto dto{Dto::JsonToForgotPasswordRequest(*body)};
        if (!dto)
            return BadRequest("Email is required");

        if (auto limited{
                CheckRateLimit(
                    m_RateLimitCache,
                    "forgot:email:" + dto->email,
                    3,
                    std::chrono::minutes(1))})
            return std::move(*limited);

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            m_AuthService.ForgotPassword(conn, *dto);
            return Ok();
        });
    }

    crow::response AuthHandler::HandleResetPassword(const crow::request& req)
    {
        if (auto limited{
                CheckRateLimit(
                    m_RateLimitCache,
                    "reset:ip:" + req.remote_ip_address,
                    5,
                    std::chrono::minutes(15))})
            return std::move(*limited);

        auto body{ParseJson(req)};
        if (!body)
            return BadRequest("Invalid JSON");

        auto dto{Dto::JsonToResetPasswordRequest(*body)};
        if (!dto)
            return BadRequest("Password and OTP are required");

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            m_AuthService.ResetPassword(conn, *dto);
            return Ok();
        });
    }

    crow::response AuthHandler::HandleResendVerificationEmail(const crow::request& req)
    {
        if (auto limited{
                CheckRateLimit(
                    m_RateLimitCache,
                    "register:ip:" + req.remote_ip_address,
                    5,
                    std::chrono::minutes(15))})
            return std::move(*limited);

        auto body{ParseJson(req)};
        if (!body)
            return BadRequest("Invalid JSON");

        auto dto{Dto::JsonToResendVerificationEmailRequest(*body)};
        if (!dto)
            return BadRequest("Email is required");

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            m_AuthService.ResendVerificationEmail(conn, *dto);
            return Ok();
        });
    }

    crow::response AuthHandler::HandleOAuthRedirect(const crow::request& req, const std::string& provider)
    {
        try
        {
            std::string url;

            if (provider == "google")
                url = m_AuthService.GetGoogleAuthUrl();
            else if (provider == "github")
                url = m_AuthService.GetGithubAuthUrl();
            else
                return BadRequest("Unsupported OAuth provider");

            crow::response res{302};
            res.set_header("Location", url);
            return res;
        }
        catch (const InternalError& e)
        {
            LOG_ERROR(e.what());
            return Error(crow::INTERNAL_SERVER_ERROR, "Server temporarily unavailable");
        }
        catch (const AppError& e)
        {
            LOG_ERROR(e.what());
            return Error(e.statusCode, e.what());
        }
        catch (const std::exception& e)
        {
            LOG_ERROR(e.what());
            return Error(crow::INTERNAL_SERVER_ERROR, "Server temporarily unavailable");
        }
    }

    crow::response AuthHandler::HandleOAuthCallback(const crow::request& req, const std::string& provider)
    {
        auto code{req.url_params.get("code")};
        if (!code)
            return BadRequest("Missing OAuth code");

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto result{m_AuthService.OAuthLogin(conn, provider, std::string{code})};

            std::string appUrl{m_AppUrl + "/auth/callback#token=" + result.token};

            // TODO: Redirect to client app
            crow::response res{302};
            res.add_header("Location", appUrl);
            return res;
        });
    }

    crow::response AuthHandler::HandleGetSessionUser(const crow::request& req)
    {
        auto body{ParseJson(req)};
        if (!body)
            return BadRequest("Invalid JSON");

        if (!body->has("token"))
            return BadRequest("Token is required");

        std::string token{(*body)["token"].s()};

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto sessionUser{m_AuthService.GetSessionUser(conn, token)};
            return Ok(Dto::SessionUserToJson(sessionUser));
        });
    }

} // namespace CLingo
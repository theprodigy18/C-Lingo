// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <crow/crow_all.h>

#include "Auth/RegisterRequest.hpp"
#include "Auth/LoginRequest.hpp"
#include "Auth/VerifyEmailRequest.hpp"
#include "Auth/ForgotPasswordRequest.hpp"
#include "Auth/ResetPasswordRequest.hpp"
#include "Auth/ResendVerificationEmailRequest.hpp"
#include "Auth/AuthResponse.hpp"

namespace CLingo::Dto
{
#pragma region Auth
    inline std::optional<RegisterRequest> JsonToRegisterRequest(const crow::json::rvalue& j)
    {
        if (!j.has("username") || !j.has("email") || !j.has("password"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return RegisterRequest{
            .username = j["username"].s(),
            .email = j["email"].s(),
            .password = j["password"].s()};
    }

    inline std::optional<LoginRequest> JsonToLoginRequest(const crow::json::rvalue& j)
    {
        if (!j.has("email") || !j.has("password"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return LoginRequest{
            .email = j["email"].s(),
            .password = j["password"].s(),
        };
    }

    inline std::optional<VerifyEmailRequest> JsonToVerifyEmailRequest(const crow::json::rvalue& j)
    {
        if (!j.has("email") || !j.has("otp"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return VerifyEmailRequest{
            .email = j["email"].s(),
            .otp = j["otp"].s(),
        };
    }

    inline std::optional<ForgotPasswordRequest> JsonToForgotPasswordRequest(const crow::json::rvalue& j)
    {
        if (!j.has("email"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return ForgotPasswordRequest{
            .email = j["email"].s(),
        };
    }

    inline std::optional<ResetPasswordRequest> JsonToResetPasswordRequest(const crow::json::rvalue& j)
    {
        if (!j.has("token") || !j.has("new_password"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return ResetPasswordRequest{
            .token = j["token"].s(),
            .newPassword = j["new_password"].s(),
        };
    }

    inline std::optional<ResendVerificationEmailRequest> JsonToResendVerificationEmailRequest(const crow::json::rvalue& j)
    {
        if (!j.has("email"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return ResendVerificationEmailRequest{
            .email = j["email"].s(),
        };
    }

    inline crow::json::wvalue AuthResponseToJson(const AuthResponse& res)
    {
        crow::json::wvalue j;
        j["token"] = res.token;
        j["user"]["id"] = res.user.id;
        j["user"]["username"] = res.user.username;
        j["user"]["display_name"] = res.user.displayName;
        j["user"]["avatar_url"] = res.user.avatarUrl;

        return j;
    }

#pragma endregion

} // namespace CLingo::Dto
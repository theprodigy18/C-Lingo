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

#include "User/UserState.hpp"
#include "User/PrivateUser.hpp"
#include "User/EditProfileRequest.hpp"

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

    inline crow::json::wvalue UserStateToJson(const Dto::UserState& state)
    {
        crow::json::wvalue j;
        j["user"]["aura"] = state.aura;
        j["user"]["energy"] = state.energy;
        j["user"]["current_streak"] = state.currentStreak;
        j["user"]["longest_streak"] = state.longestStreak;
        j["user"]["can_claim_daily_energy"] = state.canClaimDailyEnergy;
        j["user"]["next_energy_refill_seconds"] = state.nextEnergyRefillSeconds;

        return j;
    }

    inline crow::json::wvalue PrivateUserToJson(const Dto::PrivateUser& user)
    {
        crow::json::wvalue j;
        j["user"]["username"] = user.username;
        j["user"]["display_name"] = user.displayName;
        j["user"]["email"] = user.email;
        j["user"]["avatar_url"] = user.avatarUrl;
        j["user"]["current_streak"] = user.currentStreak;
        j["user"]["longest_streak"] = user.longestStreak;

        return j;
    }

    inline std::optional<EditProfileRequest> JsonToEditProfileRequest(const crow::json::rvalue& j)
    {
        if (!j.has("username") || !j.has("display_name"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return EditProfileRequest{
            .username = j["username"].s(),
            .displayName = j["display_name"].s(),
        };
    };
} // namespace CLingo::Dto
// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include "EmailService.hpp"
#include "OAuthService.hpp"
#include <Repository/AuthRepository.hpp>
#include <Dto/Auth/AuthResponse.hpp>
#include <Dto/Auth/RegisterRequest.hpp>
#include <Dto/Auth/LoginRequest.hpp>
#include <Dto/Auth/VerifyEmailRequest.hpp>
#include <Dto/Auth/ForgotPasswordRequest.hpp>
#include <Dto/Auth/ResetPasswordRequest.hpp>

namespace CLingo
{
    class AuthService
    {
    public:
        AuthService(
            AuthRepository& authRepository,
            EmailService& emailService,
            OAuthService& oAuthService,
            const std::string& jwtSecret,
            const std::string& jwtIssuer);

        // Email auth
        void Register(
            PooledConnection& conn,
            const Dto::RegisterRequest& dto);
        Dto::AuthResponse Login(
            PooledConnection& conn,
            const Dto::LoginRequest& dto);
        Dto::AuthResponse VerifyEmail(
            PooledConnection& conn,
            const Dto::VerifyEmailRequest& dto);
        void ForgotPassword(
            PooledConnection& conn,
            const Dto::ForgotPasswordRequest& dto);
        void ResetPassword(
            PooledConnection& conn,
            const Dto::ResetPasswordRequest& dto);

        // OAuth
        std::string GetGoogleAuthUrl() const;
        std::string GetGithubAuthUrl() const;
        Dto::AuthResponse OAuthLogin(
            PooledConnection& conn,
            const std::string& provider,
            const std::string& code);

    private:
        // Generate 6-digit OTP for email verification
        static std::string GenerateOTP();
        // Generate random token for password reset
        static std::string GenerateResetToken();

    private:
        AuthRepository& m_AuthRepo;
        EmailService& m_EmailService;
        OAuthService& m_OAuthService;
        const std::string& m_JwtSecret;
        const std::string& m_JwtIssuer;
    };
} // namespace CLingo
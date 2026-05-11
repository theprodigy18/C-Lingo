// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "AuthService.hpp"

#include <sstream>
#include <iomanip>

#include <Util/Password.hpp>
#include <Util/Jwt.hpp>
#include <Dto/ModelToDtoParser.hpp>

namespace CLingo
{
    AuthService::AuthService(AuthRepository& authRepo,
                             EmailService& emailService,
                             OAuthService& oauthService,
                             const std::string& jwtSecret,
                             const std::string& jwtIssuer)
        : m_AuthRepo{authRepo}, m_EmailService{emailService}, m_OAuthService{oauthService}, m_JwtSecret{jwtSecret}, m_JwtIssuer{jwtIssuer} {}

    void AuthService::Register(
        PooledConnection& conn,
        const Dto::RegisterRequest& dto)
    {
        // TODO: Validate input

        if (m_AuthRepo.EmailExists(conn, dto.email))
            throw ConflictError("Email already in use");

        if (m_AuthRepo.UsernameExists(conn, dto.username))
            throw ConflictError("Username already taken");

        auto passwordHash{Password::Hash(dto.password)};
        auto user{
            m_AuthRepo.CreateUser(
                conn,
                dto.username,
                dto.email,
                passwordHash)};
        auto otp{GenerateOTP()};

        m_AuthRepo.CreateToken(
            conn,
            user.id,
            otp,
            "email_verification",
            std::chrono::minutes(15));

        m_EmailService.SendVerificationEmail(
            dto.email,
            dto.username,
            otp);
    }

    Dto::AuthResponse AuthService::Login(
        PooledConnection& conn,
        const Dto::LoginRequest& dto)
    {
        // TODO: Validate input

        auto user{m_AuthRepo.FindByEmail(conn, dto.email)};
        if (!user)
            throw UnauthorizedError("Invalid email or password");

        if (!user->isVerified)
            throw ForbiddenError("Email not verified. Please re-register to receive a new verification code.");

        if (!Password::Verify(dto.password, user->passwordHash))
            throw UnauthorizedError("Invalid email or password");

        auto token{Jwt::Generate(user->id, m_JwtSecret, m_JwtIssuer)};

        auto sessionUser{Dto::UserToSessionUser(*user)};

        return Dto::AuthResponse{token, std::move(sessionUser)};
    }

    Dto::AuthResponse AuthService::VerifyEmail(
        PooledConnection& conn,
        const Dto::VerifyEmailRequest& dto)
    {
        auto user{m_AuthRepo.FindByEmail(conn, dto.email)};
        if (!user)
            throw NotFoundError("User not found");

        if (user->isVerified)
            throw ConflictError("Email already verified");

        auto authToken{
            m_AuthRepo.FindValidToken(
                conn,
                dto.otp,
                "email_verification")};
        if (!authToken)
            throw UnauthorizedError("Invalid or expired OTP");

        if (authToken->userId != user->id)
            throw UnauthorizedError("Invalid or expired OTP");

        m_AuthRepo.MarkTokenUsed(conn, authToken->id);

        m_AuthRepo.VerifyUser(conn, user->id);

        auto token{Jwt::Generate(user->id, m_JwtSecret, m_JwtIssuer)};

        auto sessionUser{Dto::UserToSessionUser(*user)};

        return Dto::AuthResponse{token, std::move(sessionUser)};
    }

    void AuthService::ForgotPassword(
        PooledConnection& conn,
        const Dto::ForgotPasswordRequest& dto)
    {
        auto user{m_AuthRepo.FindByEmail(conn, dto.email)};

        if (!user) // Dont notify if user not found
            return;

        auto token{GenerateResetToken()};

        m_AuthRepo.CreateToken(
            conn,
            user->id,
            token,
            "password_reset",
            std::chrono::hours(1));

        m_EmailService.SendResetPasswordEmail(
            dto.email,
            user->username,
            token);
    }

    void AuthService::ResetPassword(
        PooledConnection& conn,
        const Dto::ResetPasswordRequest& dto)
    {
        auto authToken{
            m_AuthRepo.FindValidToken(
                conn,
                dto.token,
                "password_reset")};
        if (!authToken)
            throw UnauthorizedError("Invalid or expired reset token");

        auto newPasswordHash{Password::Hash(dto.newPassword)};

        m_AuthRepo.UpdatePassword(
            conn,
            authToken->userId,
            newPasswordHash);

        m_AuthRepo.MarkTokenUsed(conn, authToken->id);
    }

    void AuthService::ResendVerificationEmail(
        PooledConnection& conn,
        const Dto::ResendVerificationEmailRequest& dto)
    {
        auto user{m_AuthRepo.FindByEmail(conn, dto.email)};
        if (!user || user->isVerified)
            return; // Dont notify if user not found or already verified

        auto otp{GenerateOTP()};

        m_AuthRepo.CreateToken(
            conn,
            user->id,
            otp,
            "email_verification",
            std::chrono::minutes(15));

        m_EmailService.SendVerificationEmail(
            dto.email,
            user->username,
            otp);
    }

    std::string AuthService::GetGoogleAuthUrl() const
    {
        return m_OAuthService.GetGoogleAuthUrl();
    }

    std::string AuthService::GetGithubAuthUrl() const
    {
        return m_OAuthService.GetGithubAuthUrl();
    }

    Dto::AuthResponse AuthService::OAuthLogin(
        PooledConnection& conn,
        const std::string& provider,
        const std::string& code)
    {
        std::optional<OAuthUserInfo> userInfo;

        if (provider == "google")
            userInfo = m_OAuthService.ExchangeGoogle(code);
        else if (provider == "github")
            userInfo = m_OAuthService.ExchangeGithub(code);
        else
            throw BadRequestError("Unsupported OAuth provider: " + provider);

        if (!userInfo)
            throw UnauthorizedError("Failed to exchange OAuth code");

        // Check if oauth account already registered
        auto oauthAccount{
            m_AuthRepo.FindOAuthAccount(
                conn,
                provider,
                userInfo->providerId)};

        Model::User user;

        if (oauthAccount)
        {
            auto existingUser{m_AuthRepo.FindById(conn, oauthAccount->userId)};

            if (!existingUser)
                throw NotFoundError("User not found");

            user = *existingUser;
        }
        else // Create new user
        {
            // Check if username already exists
            // If it does, append random string to username
            std::string username{userInfo->username};
            if (m_AuthRepo.UsernameExists(conn, username))
                username += "_" + GenerateOTP().substr(0, 4);

            user = m_AuthRepo.CreateOAuthUser(
                conn,
                username,
                userInfo->avatarUrl);

            m_AuthRepo.CreateOAuthAccount(
                conn,
                user.id,
                provider,
                userInfo->providerId);
        }

        auto token{Jwt::Generate(user.id, m_JwtSecret, m_JwtIssuer)};

        auto sessionUser{Dto::UserToSessionUser(user)};

        return Dto::AuthResponse{token, std::move(sessionUser)};
    }

    std::string AuthService::GenerateOTP()
    {
        u32 random;
        if (RAND_bytes(reinterpret_cast<u8*>(&random), sizeof(random)) != 1)
            throw InternalError("Failed to generate OTP");

        // Modulo 1.000.000 -> 6 digit, zero-padded
        std::ostringstream oss;
        oss << std::setw(6) << std::setfill('0') << (random % 1000000);
        return oss.str();
    }

    std::string AuthService::GenerateResetToken()
    {
        u8 bytes[32];
        if (RAND_bytes(bytes, sizeof(bytes)) != 1)
            throw InternalError("Failed to generate reset token");

        // Convert to hex string - 64 karakter
        std::ostringstream oss;
        for (auto b : bytes)
            oss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(b);

        return oss.str();
    }

} // namespace CLingo
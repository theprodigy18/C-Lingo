// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "AuthService.hpp"

#include <sstream>
#include <iomanip>

#include <Util/Password.hpp>
#include <Util/Jwt.hpp>
#include <Util/Input.hpp>
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
        // Validate input
        if (!Input::IsValidUsername(dto.username))
            throw BadRequestError("Invalid username format");

        auto email{dto.email};
        email = Input::NormalizeEmail(email);
        if (!Input::IsValidEmail(email))
            throw BadRequestError("Invalid email format");

        if (!Input::IsValidPassword(dto.password))
            throw BadRequestError("Invalid password format");

        if (m_AuthRepo.EmailExists(conn, email))
            throw ConflictError("Email already in use");

        if (m_AuthRepo.UsernameExists(conn, dto.username))
            throw ConflictError("Username already taken");

        auto passwordHash{Password::Hash(dto.password)};
        auto user{
            m_AuthRepo.CreateUser(
                conn,
                dto.username,
                email,
                passwordHash)};
        auto otp{GenerateOTP()};

        m_AuthRepo.CreateToken(
            conn,
            user.id,
            otp,
            "email_verification",
            std::chrono::minutes(15));

        m_EmailService.SendVerificationEmail(
            email,
            dto.username,
            otp);
    }

    Dto::AuthResponse AuthService::Login(
        PooledConnection& conn,
        const Dto::LoginRequest& dto)
    {
        // Validate input
        auto email{dto.email};
        email = Input::NormalizeEmail(email);
        if (!Input::IsValidEmail(email))
            throw BadRequestError("Invalid email format");

        if (!Input::IsValidPassword(dto.password))
            throw BadRequestError("Invalid password format");

        auto user{m_AuthRepo.FindByEmail(conn, email)};
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
        // Validate input
        auto email{dto.email};
        email = Input::NormalizeEmail(email);
        if (!Input::IsValidEmail(email))
            throw BadRequestError("Invalid email format");

        auto user{m_AuthRepo.FindByEmail(conn, email)};
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
        // Validate input
        auto email{dto.email};
        email = Input::NormalizeEmail(email);
        if (!Input::IsValidEmail(email))
            throw BadRequestError("Invalid email format");

        auto user{m_AuthRepo.FindByEmail(conn, email)};

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
            email,
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
        // Validate input
        auto email{dto.email};
        email = Input::NormalizeEmail(email);
        if (!Input::IsValidEmail(email))
            throw BadRequestError("Invalid email format");

        auto user{m_AuthRepo.FindByEmail(conn, email)};
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
            email,
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
            // Normalize username
            std::string username{Input::NormalizeUsername(userInfo->username)};
            // Check if username already exists
            // If it does, append random string to username
            if (username.size() < Input::MIN_USERNAME_LENGTH)
            {
                auto suffix{"_" + GenerateOTP().substr(0, 4)};

                username += suffix;
            }
            else if (m_AuthRepo.UsernameExists(conn, username))
            {
                auto suffix{"_" + GenerateOTP().substr(0, 4)};

                if (username.size() + suffix.size() > Input::MAX_USERNAME_LENGTH)
                    username.resize(Input::MAX_USERNAME_LENGTH - suffix.size());

                username += suffix;
            }

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

    Dto::SessionUser AuthService::GetSessionUser(
        PooledConnection& conn,
        const std::string& token)
    {
        auto userIdOpt{Jwt::Verify(token, m_JwtSecret, m_JwtIssuer)};
        if (!userIdOpt)
            throw UnauthorizedError("Invalid or expired token");

        auto user{m_AuthRepo.FindById(conn, *userIdOpt)};
        if (!user)
            throw NotFoundError("User not found");

        return Dto::UserToSessionUser(*user);
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
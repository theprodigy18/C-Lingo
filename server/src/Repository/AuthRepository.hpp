// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Core/UserCache.hpp>
#include <Database/PooledConnection.hpp>
#include <Model/User.hpp>
#include <Model/AuthToken.hpp>
#include <Model/OAuthAccount.hpp>

namespace CLingo
{
    class AuthRepository
    {
    public:
        explicit AuthRepository(UserCache& userCache);

        // User
        bool EmailExists(PooledConnection& conn, const std::string& email);
        bool UsernameExists(PooledConnection& conn, const std::string& username);
        std::optional<Model::User> FindByEmail(PooledConnection& conn, const std::string& email);
        std::optional<Model::User> FindById(PooledConnection& conn, i32 userId);
        Model::User CreateUser(
            PooledConnection& conn,
            const std::string& username,
            const std::string& email,
            const std::string& passwordHash);

        void VerifyUser(PooledConnection& conn, i32 userId);

        // Auth tokens (OTP & reset)
        void CreateToken(
            PooledConnection& conn,
            i32 userId,
            const std::string& token,
            const std::string& type,
            std::chrono::seconds expiresIn);
        std::optional<Model::AuthToken> FindValidToken(
            PooledConnection& conn,
            const std::string& token,
            const std::string& type);
        void MarkTokenUsed(PooledConnection& conn, i32 tokenId);

        // Password
        void UpdatePassword(PooledConnection& conn, i32 userId, const std::string& passwordHash);

        // OAuth
        std::optional<Model::OAuthAccount> FindOAuthAccount(
            PooledConnection& conn,
            const std::string& provider,
            const std::string& providerId);
        Model::OAuthAccount CreateOAuthAccount(
            PooledConnection& conn,
            i32 userId,
            const std::string& provider,
            const std::string& providerId);
        Model::User CreateOAuthUser(
            PooledConnection& conn,
            const std::string& username,
            const std::string& avatarUrl);

    private:
        UserCache& m_UserCache;
    };
} // namespace CLingo
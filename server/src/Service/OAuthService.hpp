// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo
{
    struct OAuthConfig
    {
        std::string clientId;
        std::string clientSecret;
        std::string redirectUri;
    };

    // Extracted data from provider
    struct OAuthUserInfo
    {
        std::string providerId;
        std::string username;
        std::string email; // can be null e.g. GitHub private email
        std::string avatarUrl;
    };

    class OAuthService
    {
    public:
        OAuthService(OAuthConfig google, OAuthConfig github);

        // Generate URL redirect to provider
        std::string GetGoogleAuthUrl() const;
        std::string GetGithubAuthUrl() const;

        // Exchange code with user info from provider
        std::optional<OAuthUserInfo> ExchangeGoogle(const std::string& code) const;
        std::optional<OAuthUserInfo> ExchangeGithub(const std::string& code) const;

    private:
        OAuthConfig m_Google;
        OAuthConfig m_Github;
    };
} // namespace CLingo
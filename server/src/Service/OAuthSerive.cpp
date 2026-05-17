// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "OAuthService.hpp"

#include <crow/crow_all.h>

#include <Util/Curl.hpp>

namespace CLingo
{
    OAuthService::OAuthService(OAuthConfig google, OAuthConfig github)
        : m_Google{std::move(google)}, m_Github{std::move(github)} {}

    std::string OAuthService::GetGoogleAuthUrl() const
    {
        return "https://accounts.google.com/o/oauth2/v2/auth"
               "?client_id=" +
               m_Google.clientId +
               "&redirect_uri=" + m_Google.redirectUri +
               "&response_type=code"
               "&scope=openid%20email%20profile"
               "&access_type=offline";
    }

    std::string OAuthService::GetGithubAuthUrl() const
    {
        return "https://github.com/login/oauth/authorize"
               "?client_id=" +
               m_Github.clientId +
               "&redirect_uri=" + m_Github.redirectUri +
               "&scope=read%3Auser%20user%3Aemail";
    }

    std::optional<OAuthUserInfo> OAuthService::ExchangeGoogle(const std::string& code) const
    {
        std::string tokenBody{
            "code=" + code +
            "&client_id=" + m_Google.clientId +
            "&client_secret=" + m_Google.clientSecret +
            "&redirect_uri=" + m_Google.redirectUri +
            "&grant_type=authorization_code"};

        auto tokenRes{
            Curl::PerformRequest({.url = "https://oauth2.googleapis.com/token",
                                  .body = tokenBody,
                                  .method = "POST",
                                  .headers = {
                                      "Content-Type: application/x-www-form-urlencoded"}})};

        auto tokenJson{crow::json::load(tokenRes.body)};
        if (!tokenJson || !tokenJson.has("access_token"))
            return std::nullopt;

        std::string accessToken{tokenJson["access_token"].s()};

        auto userRes{
            Curl::PerformRequest({.url = "https://openidconnect.googleapis.com/v1/userinfo",
                                  .headers = {
                                      "Authorization: Bearer " + accessToken}})};

        auto userJson{crow::json::load(userRes.body)};
        if (!userJson || !userJson.has("sub"))
            return std::nullopt;

        return OAuthUserInfo{
            std::string(userJson["sub"].s()), // unique id
            userJson.has("name") ? std::string(userJson["name"].s()) : "",
            userJson.has("email") ? std::string(userJson["email"].s()) : "",
            userJson.has("picture") ? std::string(userJson["picture"].s()) : ""};
    }

    std::optional<OAuthUserInfo> OAuthService::ExchangeGithub(const std::string& code) const
    {
        std::string tokenBody{
            "code=" + code +
            "&client_id=" + m_Github.clientId +
            "&client_secret=" + m_Github.clientSecret +
            "&redirect_uri=" + m_Github.redirectUri};

        auto tokenRes{
            Curl::PerformRequest({.url = "https://github.com/login/oauth/access_token",
                                  .body = tokenBody,
                                  .method = "POST",
                                  .headers = {
                                      "Content-Type: application/x-www-form-urlencoded",
                                      "Accept: application/json" // IMPORTANT
                                  }})};

        auto tokenJson{crow::json::load(tokenRes.body)};
        if (!tokenJson || !tokenJson.has("access_token"))
            return std::nullopt;

        std::string accessToken{tokenJson["access_token"].s()};

        // User info
        auto userRes{
            Curl::PerformRequest({.url = "https://api.github.com/user",
                                  .headers = {
                                      "Authorization: Bearer " + accessToken,
                                      "User-Agent: C-Lingo"}})};

        auto userJson{crow::json::load(userRes.body)};
        if (!userJson || !userJson.has("id"))
            return std::nullopt;

        // Email (optional)
        std::string email;
        auto emailRes{
            Curl::PerformRequest({.url = "https://api.github.com/user/emails",
                                  .headers = {
                                      "Authorization: Bearer " + accessToken,
                                      "User-Agent: C-Lingo"}})};

        auto emailJson{crow::json::load(emailRes.body)};
        if (emailJson && emailJson.t() == crow::json::type::List)
        {
            for (auto& e : emailJson)
            {
                if (e.has("primary") && e["primary"].b() &&
                    e.has("verified") && e["verified"].b())
                {
                    email = e["email"].s();
                    break;
                }
            }
        }

        // sanitize username
        std::string username{userJson["login"].s()};
        std::replace(username.begin(), username.end(), '-', '_');
        if (username.size() > 30)
            username = username.substr(0, 30);

        return OAuthUserInfo{
            std::to_string(userJson["id"].i()),
            username,
            email,
            userJson.has("avatar_url") ? std::string(userJson["avatar_url"].s()) : ""};
    }
} // namespace CLingo
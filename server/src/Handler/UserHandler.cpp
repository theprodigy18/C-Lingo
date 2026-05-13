// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "UserHandler.hpp"

#include <Dto/CrowParser.hpp>

namespace CLingo
{
    UserHandler::UserHandler(
        std::string basePath,
        App& app,
        UserService& userService,
        ConnectionPool& pool)
        : BaseHandler{basePath}, m_App{app}, m_UserService{userService}, m_Pool{pool} {}

    void UserHandler::RegisterRoutes(App& app)
    {
        app.route_dynamic(m_BasePath + "/me/state")
            .methods(crow::HTTPMethod::Get)(
                [this](const crow::request& req) {
                    return HandleGetUserState(req);
                });

        app.route_dynamic(m_BasePath + "/me")
            .methods(crow::HTTPMethod::Get)(
                [this](const crow::request& req) {
                    return HandleGetPrivateUser(req);
                });

        app.route_dynamic(m_BasePath + "/me")
            .methods(crow::HTTPMethod::Put)(
                [this](const crow::request& req) {
                    return HandleEditProfile(req);
                });

        app.route_dynamic(m_BasePath + "/me/energy/claim")
            .methods(crow::HTTPMethod::Post)(
                [this](const crow::request& req) {
                    return HandleClaimEnergy(req);
                });
    }

    crow::response UserHandler::HandleGetUserState(const crow::request& req)
    {
        const auto& auth{m_App.get_context<AuthMiddleware>(req)};

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto userState{m_UserService.GetUserState(conn, auth.userId)};
            if (!userState)
                return NotFound("User not found");

            return Ok(Dto::UserStateToJson(*userState));
        });
    }

    crow::response UserHandler::HandleGetPrivateUser(const crow::request& req)
    {
        const auto& auth{m_App.get_context<AuthMiddleware>(req)};

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto user{m_UserService.GetPrivateUser(conn, auth.userId)};
            if (!user)
                return NotFound("User not found");

            return Ok(Dto::PrivateUserToJson(*user));
        });
    }

    crow::response UserHandler::HandleEditProfile(const crow::request& req)
    {
        const auto& auth{m_App.get_context<AuthMiddleware>(req)};

        auto json{crow::json::load(req.body)};
        if (!json)
            return BadRequest("Invalid JSON");

        auto dto{Dto::JsonToEditProfileRequest(json)};
        if (!dto)
            return BadRequest("Username and display name is required");

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            m_UserService.EditProfile(conn, auth.userId, *dto);
            return Ok();
        });
    }

    crow::response UserHandler::HandleClaimEnergy(const crow::request& req)
    {
        const auto& auth{m_App.get_context<AuthMiddleware>(req)};

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            m_UserService.ClaimEnergy(conn, auth.userId);
            return Ok();
        });
    }

} // namespace CLingo
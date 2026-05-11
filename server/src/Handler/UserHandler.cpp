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
} // namespace CLingo
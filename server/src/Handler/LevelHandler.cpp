// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "LevelHandler.hpp"

#include <Dto/CrowParser.hpp>

namespace CLingo
{
    LevelHandler::LevelHandler(
        std::string basePath,
        App& app,
        LevelService& levelService,
        ConnectionPool& pool)
        : BaseHandler{basePath}, m_App{app}, m_LevelService{levelService}, m_Pool{pool} {}

    void LevelHandler::RegisterRoutes(App& app)
    {
        app.route_dynamic(m_BasePath)
            .methods(crow::HTTPMethod::Get)(
                [this](const crow::request& req) {
                    return HandleGetLevels(req);
                });
    }

    crow::response LevelHandler::HandleGetLevels(const crow::request& req)
    {
        const auto& auth{m_App.get_context<AuthMiddleware>(req)};

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto response{m_LevelService.GetLevels(conn, auth.userId)};

            crow::json::wvalue j{Dto::LevelListResponseToJson(response)};
            return Ok(std::move(j));
        });
    }
} // namespace CLingo
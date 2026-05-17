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

        app.route_dynamic(m_BasePath + "/detail")
            .methods(crow::HTTPMethod::Post)(
                [this](const crow::request& req) {
                    return HandleGetLevelDetail(req);
                });

        app.route_dynamic(m_BasePath + "/quiz/submit")
            .methods(crow::HTTPMethod::Post)(
                [this](const crow::request& req) {
                    return HandleSubmitQuiz(req);
                });

        app.route_dynamic(m_BasePath + "/start")
            .methods(crow::HTTPMethod::Post)(
                [this](const crow::request& req) {
                    return HandleStartLevel(req);
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

    crow::response LevelHandler::HandleGetLevelDetail(const crow::request& req)
    {
        const auto& auth{m_App.get_context<AuthMiddleware>(req)};

        auto json{crow::json::load(req.body)};
        if (!json)
            return BadRequest("Invalid JSON");

        if (!json.has("level_id"))
            return BadRequest("level_id is required");

        i32 levelId = json["level_id"].i();

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto response{m_LevelService.GetLevelDetail(conn, auth.userId, levelId)};

            crow::json::wvalue j{Dto::LevelDetailResponseToJson(response)};
            return Ok(std::move(j));
        });
    }

    crow::response LevelHandler::HandleSubmitQuiz(const crow::request& req)
    {
        const auto& auth{m_App.get_context<AuthMiddleware>(req)};

        auto json{crow::json::load(req.body)};
        if (!json)
            return BadRequest("Invalid JSON");

        auto dto{Dto::JsonToQuizSubmitRequest(json)};
        if (!dto)
            return BadRequest("Invalid quiz submission");

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto response{m_LevelService.SubmitQuiz(conn, auth.userId, *dto)};

            crow::json::wvalue j{Dto::QuizSubmitResponseToJson(response)};
            return Ok(std::move(j));
        });
    }

    crow::response LevelHandler::HandleStartLevel(const crow::request& req)
    {
        const auto& auth{m_App.get_context<AuthMiddleware>(req)};

        auto json{crow::json::load(req.body)};
        if (!json)
            return BadRequest("Invalid JSON");

        auto dto{Dto::JsonToStartLevelRequest(json)};
        if (!dto)
            return BadRequest("Invalid request");

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto response{m_LevelService.StartLevel(conn, auth.userId, *dto)};

            crow::json::wvalue j{Dto::StartLevelResponseToJson(response)};
            return Ok(std::move(j));
        });
    }
} // namespace CLingo
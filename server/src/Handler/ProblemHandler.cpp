// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "ProblemHandler.hpp"

#include <Dto/CrowParser.hpp>

namespace CLingo
{
    ProblemHandler::ProblemHandler(
        std::string basePath,
        App& app,
        ProblemService& problemService,
        SubmissionService& submissionService,
        ConnectionPool& pool)
        : BaseHandler{basePath}, m_App{app}, m_ProblemService{problemService}, m_SubmissionService{submissionService}, m_Pool{pool} {}

    void ProblemHandler::RegisterRoutes(App& app)
    {
        app.route_dynamic(m_BasePath)
            .methods(crow::HTTPMethod::Get)([this](const crow::request& req) {
                return HandleGetProblems(req);
            });

        app.route_dynamic(m_BasePath + "/<int>")
            .methods(crow::HTTPMethod::Get)([this](const crow::request& req, int problemId) {
                return HandleGetProblemDetail(req, problemId);
            });

        app.route_dynamic(m_BasePath + "/<int>/submit")
            .methods(crow::HTTPMethod::Post)([this](const crow::request& req, int problemId) {
                return HandleSubmitCode(req, problemId);
            });

        app.route_dynamic(m_BasePath + "/<int>/submissions")
            .methods(crow::HTTPMethod::Get)([this](const crow::request& req, int problemId) {
                return HandleGetSubmissions(req, problemId);
            });
    }

    crow::response ProblemHandler::HandleGetProblems(const crow::request& req)
    {
        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto response = m_ProblemService.GetProblemList(conn);
            crow::json::wvalue j{Dto::ProblemListResponseToJson(response)};
            return Ok(std::move(j));
        });
    }

    crow::response ProblemHandler::HandleGetProblemDetail(const crow::request& req, i32 problemId)
    {
        auto json = crow::json::load(req.body);
        if (!json)
            return BadRequest("Invalid JSON");

        bool includeHidden = json.has("include_hidden") && json["include_hidden"].b();

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto response = m_ProblemService.GetProblemDetail(conn, problemId, includeHidden);

            if (!response.hasProblem)
                return NotFound("Problem not found");

            crow::json::wvalue j{Dto::ProblemDetailResponseToJson(response)};
            return Ok(std::move(j));
        });
    }

    crow::response ProblemHandler::HandleSubmitCode(const crow::request& req, i32 problemId)
    {
        const auto& auth = m_App.get_context<AuthMiddleware>(req);

        auto json = crow::json::load(req.body);
        if (!json)
            return BadRequest("Invalid JSON");

        if (!json.has("code"))
            return BadRequest("code is required");

        std::string code = json["code"].s();

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            i32 submissionId = m_SubmissionService.CreateSubmission(conn, auth.userId, problemId, code);

            crow::json::wvalue j;
            j["submission_id"] = submissionId;
            j["status"] = "pending";

            return Ok(std::move(j));
        });
    }

    crow::response ProblemHandler::HandleGetSubmissions(const crow::request& req, i32 problemId)
    {
        const auto& auth = m_App.get_context<AuthMiddleware>(req);

        return WithConnection(m_Pool, [&](PooledConnection& conn) {
            auto response = m_SubmissionService.GetSubmissions(conn, auth.userId, problemId);
            crow::json::wvalue j{Dto::SubmissionListResponseToJson(response)};
            return Ok(std::move(j));
        });
    }
} // namespace CLingo

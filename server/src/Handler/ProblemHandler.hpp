// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Common/App.hpp>
#include "BaseHandler.hpp"
#include <Service/ProblemService.hpp>
#include <Service/SubmissionService.hpp>

namespace CLingo
{
    class ProblemHandler : public BaseHandler
    {
    public:
        ProblemHandler(
            std::string basePath,
            App& app,
            ProblemService& problemService,
            SubmissionService& submissionService,
            ConnectionPool& pool);

        void RegisterRoutes(App& app) override;

    private:
        crow::response HandleGetProblems(const crow::request& req);
        crow::response HandleGetProblemDetail(const crow::request& req, i32 problemId);
        crow::response HandleSubmitCode(const crow::request& req, i32 problemId);
        crow::response HandleGetSubmissions(const crow::request& req, i32 problemId);

    private:
        App& m_App;
        ProblemService& m_ProblemService;
        SubmissionService& m_SubmissionService;
        ConnectionPool& m_Pool;
    };
} // namespace CLingo

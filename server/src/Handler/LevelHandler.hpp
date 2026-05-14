// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Common/App.hpp>
#include "BaseHandler.hpp"
#include <Service/LevelService.hpp>

namespace CLingo
{
    class LevelHandler : public BaseHandler
    {
    public:
        LevelHandler(
            std::string basePath,
            App& app,
            LevelService& levelService,
            ConnectionPool& pool);

        void RegisterRoutes(App& app) override;

    private:
        crow::response HandleGetLevels(const crow::request& req);
        crow::response HandleGetLevelDetail(const crow::request& req);
        crow::response HandleSubmitQuiz(const crow::request& req);
        crow::response HandleStartLevel(const crow::request& req);

    private:
        App& m_App;
        LevelService& m_LevelService;
        ConnectionPool& m_Pool;
    };
} // namespace CLingo
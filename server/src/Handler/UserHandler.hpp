// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include "BaseHandler.hpp"
#include <Service/UserService.hpp>

namespace CLingo
{
    class UserHandler : public BaseHandler
    {
    public:
        UserHandler(
            std::string basePath,
            App& app,
            UserService& userService,
            ConnectionPool& pool);

        void RegisterRoutes(App& app) override;

    private:
        crow::response HandleGetUserState(const crow::request& req);
        crow::response HandleGetPrivateUser(const crow::request& req);
        crow::response HandleEditProfile(const crow::request& req);
        crow::response HandleClaimEnergy(const crow::request& req);

    private:
        App& m_App;
        UserService& m_UserService;
        ConnectionPool& m_Pool;
    };
} // namespace CLingo
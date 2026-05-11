// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Common/App.hpp>
#include <Core/CleanupManager.hpp>
#include <Core/UserCache.hpp>
#include <Core/CounterCache.hpp>
#include <Database/ConnectionPool.hpp>
#include <Repository/AuthRepository.hpp>
#include <Repository/UserRepository.hpp>
#include <Service/EmailService.hpp>
#include <Service/OAuthService.hpp>
#include <Service/AuthService.hpp>
#include <Service/UserService.hpp>
#include <Handler/IHandler.hpp>

namespace CLingo
{
    struct ServerConfig
    {
        // ─── Network ──────────────────────────────────────────────────────────
        std::string bindAddr{"127.0.0.1"};
        i32 port{3000};
        i32 threads{4};

        // ─── Database ─────────────────────────────────────────────────────────
        std::string connStr;
        i32 connPoolSize{8};

        // ─── JWT ──────────────────────────────────────────────────────────────
        std::string jwtSecret;
        std::string jwtIssuer = {"C-Lingo"};
        i32 jwtExpiryHours = 24;

        // ─── CORS ─────────────────────────────────────────────────────────────
        std::string corsOrigin{"*"};

        // ─── OAuth ────────────────────────────────────────────────────────────
        std::string oauthRedirectBase;
        OAuthConfig google;
        OAuthConfig github;

        // ─── Email ────────────────────────────────────────────────────────────
        EmailConfig email;

        // ─── App ──────────────────────────────────────────────────────────────
        std::string appUrl{"http://localhost:5173"};
    };

    class Server final
    {
    public:
        explicit Server(ServerConfig config);
        ~Server();

        bool Init();
        void Start();

    private:
        bool SetupInfrastructure();
        bool SetupModules();

    private:
        ServerConfig m_Config;
        std::unique_ptr<App> m_App;

        // Managers
        std::unique_ptr<CleanupManager> m_CleanupManager;

        // Caches
        std::unique_ptr<UserCache> m_UserCache;
        std::unique_ptr<CounterCache> m_CounterCache;

        // Databases
        std::unique_ptr<ConnectionPool> m_Pool;

        // Repositories
        std::unique_ptr<AuthRepository> m_AuthRepository;
        std::unique_ptr<UserRepository> m_UserRepository;

        // Services
        std::unique_ptr<EmailService> m_EmailService;
        std::unique_ptr<OAuthService> m_OAuthService;
        std::unique_ptr<AuthService> m_AuthService;
        std::unique_ptr<UserService> m_UserService;

        // Handlers
        std::vector<std::unique_ptr<IHandler>> m_Handlers;
    };
} // namespace CLingo
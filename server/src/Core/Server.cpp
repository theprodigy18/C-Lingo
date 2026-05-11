// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "Server.hpp"

#include <Handler/AuthHandler.hpp>
#include <Handler/UserHandler.hpp>

namespace CLingo
{
    Server::Server(ServerConfig config)
        : m_Config(config) {}

    Server::~Server() = default;

    bool Server::Init()
    {
        m_App = std::make_unique<App>();

        if (!SetupInfrastructure())
            return false;
        if (!SetupModules())
            return false;

        return true;
    }

    void Server::Start()
    {
// Reduce log verbosity in production
#ifdef NDEBUG
        m_App->loglevel(crow::LogLevel::Warning);
#endif // NDEBUG

        // Configure network binding and start request handling
        m_App->bindaddr(m_Config.bindAddr)
            .port(m_Config.port)
            .concurrency(m_Config.threads)
            .run();
    }

    bool Server::SetupInfrastructure()
    {
        // Configure global CORS policy
        auto& cors{m_App->get_middleware<crow::CORSHandler>()};
        cors.global()
            .methods(crow::HTTPMethod::Get, crow::HTTPMethod::Post, crow::HTTPMethod::Put, crow::HTTPMethod::Delete)
            .headers("Content-Type", "Authorization")
            .origin(m_Config.corsOrigin)
            .prefix("/api")
            .max_age(3600);

        // Configure authentication middleware
        auto& auth{m_App->get_middleware<AuthMiddleware>()};
        auth.jwtIssuer = m_Config.jwtIssuer;
        auth.jwtSecret = m_Config.jwtSecret;

        return true;
    }

    bool Server::SetupModules()
    {
        // Setup managers
        m_CleanupManager = std::make_unique<CleanupManager>();

        // Setup caches
        m_UserCache = std::make_unique<UserCache>();
        m_CounterCache = std::make_unique<CounterCache>();

        m_CleanupManager->Register([this]() { m_UserCache->Cleanup(); });
        m_CleanupManager->Register([this]() { m_CounterCache->Cleanup(); });

        // Setup databases
        m_Pool = std::make_unique<ConnectionPool>(m_Config.connStr, m_Config.connPoolSize);

        // Setup repositories
        m_AuthRepository = std::make_unique<AuthRepository>(*m_UserCache);
        m_UserRepository = std::make_unique<UserRepository>(*m_UserCache);

        // Setup services
        m_EmailService = std::make_unique<EmailService>(m_Config.email);
        m_OAuthService = std::make_unique<OAuthService>(m_Config.google, m_Config.github);
        m_AuthService = std::make_unique<AuthService>(
            *m_AuthRepository,
            *m_EmailService,
            *m_OAuthService,
            m_Config.jwtSecret,
            m_Config.jwtIssuer);
        m_UserService = std::make_unique<UserService>(*m_UserRepository);

        // Setup handlers
        m_Handlers.push_back(
            std::make_unique<AuthHandler>(
                "/api/auth",
                *m_AuthService,
                *m_CounterCache,
                *m_Pool,
                m_Config.appUrl));
        m_Handlers.push_back(
            std::make_unique<UserHandler>(
                "/api/user",
                *m_App,
                *m_UserService,
                *m_Pool));

        for (auto& handler : m_Handlers)
            handler->RegisterRoutes(*m_App);

        return true;
    }
} // namespace CLingo
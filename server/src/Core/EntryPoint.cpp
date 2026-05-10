// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "EntryPoint.hpp"

#include <pqxx/pqxx>

#include "Server.hpp"
#include <Util/EnvLoader.hpp>

namespace CLingo
{
    namespace
    {
        void InitSchema(pqxx::connection& conn)
        {
            pqxx::work txn(conn);

            // ---------------------------------------------------------------
            // USERS & AUTH
            // ---------------------------------------------------------------

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS users (
            id                 SERIAL PRIMARY KEY,
            username           VARCHAR(50)  UNIQUE NOT NULL,
            display_name       VARCHAR(100) NOT NULL,
            email              VARCHAR(255) UNIQUE,
            password_hash      TEXT,
            is_verified        BOOLEAN      NOT NULL DEFAULT FALSE,
            avatar_url         TEXT,
 
            aura               INT          NOT NULL DEFAULT 0   CHECK (aura >= 0),
            energy             INT          NOT NULL DEFAULT 100 CHECK (energy BETWEEN 0 AND 100),
            last_energy_refill TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
 
            current_streak     INT          NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
            longest_streak     INT          NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
            last_login_date    DATE,
 
            created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
        );
    )");

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS oauth_accounts (
            id          SERIAL PRIMARY KEY,
            user_id     INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            provider    TEXT NOT NULL,
            provider_id TEXT NOT NULL,
            UNIQUE(provider, provider_id)
        );
    )");

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS auth_tokens (
            id         SERIAL PRIMARY KEY,
            user_id    INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token      TEXT NOT NULL,
            type       TEXT NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            used_at    TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, type)
        );
    )");

            // ---------------------------------------------------------------
            // JOURNEY
            // ---------------------------------------------------------------

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS levels (
            id               SERIAL PRIMARY KEY,
            level_number     INT          NOT NULL UNIQUE CHECK (level_number >= 1),
            title            VARCHAR(200) NOT NULL,
            content_md       TEXT         NOT NULL,
            energy_cost      INT          NOT NULL DEFAULT 10  CHECK (energy_cost >= 0),
            quiz_aura_reward INT          NOT NULL DEFAULT 50  CHECK (quiz_aura_reward >= 0),
            is_published     BOOLEAN      NOT NULL DEFAULT FALSE,
            created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
        );
    )");

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS quiz_questions (
            id            SERIAL PRIMARY KEY,
            level_id      INT  NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
            question_text TEXT NOT NULL,
            explanation   TEXT,
            order_index   INT  NOT NULL DEFAULT 0
        );
    )");

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS quiz_options (
            id          SERIAL PRIMARY KEY,
            question_id INT     NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
            option_text TEXT    NOT NULL,
            is_correct  BOOLEAN NOT NULL DEFAULT FALSE
        );
    )");

            // ---------------------------------------------------------------
            // USER PROGRESS
            // ---------------------------------------------------------------

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS user_level_progress (
            id           SERIAL  PRIMARY KEY,
            user_id      INT     NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
            level_id     INT     NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
            is_unlocked  BOOLEAN NOT NULL DEFAULT FALSE,
            is_completed BOOLEAN NOT NULL DEFAULT FALSE,
            quiz_score   INT     CHECK (quiz_score BETWEEN 0 AND 100),
            attempts     INT     NOT NULL DEFAULT 0,
            completed_at TIMESTAMPTZ,
            UNIQUE(user_id, level_id)
        );
    )");

            // ---------------------------------------------------------------
            // CODING PRACTICE
            // ---------------------------------------------------------------

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS problems (
            id             SERIAL PRIMARY KEY,
            title          VARCHAR(200) NOT NULL,
            slug           TEXT         NOT NULL UNIQUE,
            description_md TEXT         NOT NULL,
            constraints_md TEXT,
            starter_code   TEXT         NOT NULL,
            solution_code  TEXT,
            difficulty     VARCHAR(20)  NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
            energy_cost    INT          NOT NULL DEFAULT 5   CHECK (energy_cost >= 0),
            aura_reward    INT          NOT NULL DEFAULT 100 CHECK (aura_reward >= 0),
            is_published   BOOLEAN      NOT NULL DEFAULT FALSE,
            created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
        );
    )");

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS test_cases (
            id              SERIAL PRIMARY KEY,
            problem_id      INT     NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
            input           TEXT    NOT NULL,
            expected_output TEXT    NOT NULL,
            is_hidden       BOOLEAN NOT NULL DEFAULT FALSE,
            order_index     INT     NOT NULL DEFAULT 0
        );
    )");

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS submissions (
            id                SERIAL PRIMARY KEY,
            user_id           INT         NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
            problem_id        INT         NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
            code              TEXT        NOT NULL,
            language          VARCHAR(20) NOT NULL DEFAULT 'c',
            status            VARCHAR(30) NOT NULL CHECK (status IN (
                                  'pending', 'running',
                                  'accepted', 'wrong_answer',
                                  'time_limit_exceeded', 'memory_limit_exceeded',
                                  'runtime_error', 'compile_error'
                              )),
            runtime_ms        INT,
            memory_kb         INT,
            time_complexity   VARCHAR(30),
            memory_complexity VARCHAR(30),
            error_output      TEXT,
            submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    )");

            // ---------------------------------------------------------------
            // AUDIT / ECONOMY LOGS
            // ---------------------------------------------------------------

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS energy_logs (
            id         SERIAL PRIMARY KEY,
            user_id    INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            delta      INT  NOT NULL,
            reason     TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    )");

            txn.exec(R"(
        CREATE TABLE IF NOT EXISTS aura_logs (
            id         SERIAL PRIMARY KEY,
            user_id    INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            delta      INT  NOT NULL,
            reason     TEXT NOT NULL,
            ref_id     INT,
            ref_type   TEXT CHECK (ref_type IN ('level', 'problem')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    )");

            // ---------------------------------------------------------------
            // INDEXES
            // ---------------------------------------------------------------

            // Auth
            txn.exec(
                "CREATE INDEX IF NOT EXISTS idx_oauth_user_id "
                "ON oauth_accounts(user_id);");

            txn.exec(
                "CREATE INDEX IF NOT EXISTS idx_auth_tokens_lookup "
                "ON auth_tokens(token, type) WHERE used_at IS NULL;");

            // Global leaderboard
            txn.exec(
                "CREATE INDEX IF NOT EXISTS idx_users_aura "
                "ON users(aura DESC);");

            // Journey
            txn.exec(
                "CREATE INDEX IF NOT EXISTS idx_quiz_questions_level "
                "ON quiz_questions(level_id, order_index);");

            txn.exec(
                "CREATE INDEX IF NOT EXISTS idx_progress_user "
                "ON user_level_progress(user_id, level_id);");

            // Submissions — partial index hanya untuk accepted,
            // dipakai oleh kedua leaderboard (by time & by memory)
            txn.exec(
                "CREATE INDEX IF NOT EXISTS idx_submissions_lb_time "
                "ON submissions(problem_id, runtime_ms ASC NULLS LAST) "
                "WHERE status = 'accepted';");

            txn.exec(
                "CREATE INDEX IF NOT EXISTS idx_submissions_lb_memory "
                "ON submissions(problem_id, memory_kb ASC NULLS LAST) "
                "WHERE status = 'accepted';");

            txn.exec(
                "CREATE INDEX IF NOT EXISTS idx_submissions_user_problem "
                "ON submissions(user_id, problem_id, status);");

            // Logs
            txn.exec(
                "CREATE INDEX IF NOT EXISTS idx_energy_logs_user "
                "ON energy_logs(user_id, created_at DESC);");

            txn.exec(
                "CREATE INDEX IF NOT EXISTS idx_aura_logs_user "
                "ON aura_logs(user_id, created_at DESC);");

            txn.commit();
        }
    } // anonymous namespace

    int Run()
    {
        try
        {
            EnvLoader env{".env"};
            ServerConfig config;

            // Network
            config.bindAddr = env.Get("ADDRESS", "127.0.0.1");
            config.port = std::stoi(env.Get("PORT", "3000"));
            config.threads = std::stoi(env.Get("THREADS", "4"));

            // Database
            config.connStr =
                "host=" + env.Require("DB_HOST") +
                " port=" + env.Get("DB_PORT", "5432") +
                " dbname=" + env.Require("DB_NAME") +
                " user=" + env.Require("DB_USER") +
                " password=" + env.Require("DB_PASSWORD") +
                " sslmode=" + env.Get("DB_SSLMODE", "disable");
            config.connPoolSize = std::stoi(env.Get("DB_POOL_SIZE", "8"));

            // JWT
            config.jwtSecret = env.Require("JWT_SECRET");
            config.jwtIssuer = env.Get("JWT_ISSUER", "C-Lingo");
            config.jwtExpiryHours = std::stoi(env.Get("JWT_EXPIRY_HOURS", "24"));

            // CORS
            config.corsOrigin = env.Get("CORS_ORIGIN", "*");

            // OAuth
            config.oauthRedirectBase = env.Get("OAUTH_REDIRECT_BASE", "http://localhost:3000/api/auth");
            config.google.clientId = env.Require("GOOGLE_CLIENT_ID");
            config.google.clientSecret = env.Require("GOOGLE_CLIENT_SECRET");
            config.google.redirectUri = config.oauthRedirectBase + "/google/callback";
            config.github.clientId = env.Require("GITHUB_CLIENT_ID");
            config.github.clientSecret = env.Require("GITHUB_CLIENT_SECRET");
            config.github.redirectUri = config.oauthRedirectBase + "/github/callback";

            // Email
            config.email.apiKey = env.Require("RESEND_API_KEY");
            config.email.fromAddress = env.Get("RESEND_FROM_ADDRESS", "onboarding@resend.dev");
            config.email.fromName = env.Get("RESEND_FROM_NAME", "C-Lingo");

            // App
            config.appUrl = env.Get("APP_URL", "http://localhost:5173");
            config.email.appUrl = config.appUrl; // EmailConfig need appUrl

            // Init database schema
            {
                pqxx::connection conn{config.connStr};
                InitSchema(conn);
            }

            Server server{config};
            if (!server.Init())
                return 1;

            server.Start();
            return 0;
        }
        catch (const AppError& e)
        {
            LOG_CRITICAL(e.what());
            return 1;
        }
        catch (const std::exception& e)
        {
            LOG_CRITICAL(e.what());
            return 1;
        }
    }
} // namespace CLingo
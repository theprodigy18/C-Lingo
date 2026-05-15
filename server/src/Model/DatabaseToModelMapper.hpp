// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <pqxx/pqxx>

#include "User.hpp"
#include "AuthToken.hpp"
#include "OAuthAccount.hpp"
#include "EnergyLog.hpp"
#include "Level.hpp"
#include "Problem.hpp"
#include "Submission.hpp"

namespace CLingo::Model
{
    namespace
    {
        // Convert tm to time_t treating tm as UTC (not local time)
        // Windows uses _mkgmtime, POSIX uses timegm
        inline std::time_t UtcToTimeT(std::tm& tm)
        {
#ifdef _WIN64
            return _mkgmtime(&tm);
#else
            return ::timegm(&tm);
#endif
        }
    } // anonymous namespace

    inline User MapUser(const pqxx::row& row)
    {
        std::string timestampStr{row["last_energy_refill"].as<std::string>()};

        std::tm tm{};
        std::istringstream ss{timestampStr};
        ss >> std::get_time(&tm, "%Y-%m-%d %H:%M:%S");

        // PostgreSQL TIMESTAMPTZ is stored as UTC.
        // std::mktime interprets tm as local time, causing offset on non-UTC systems.
        // Use UtcToTimeT to correctly parse UTC timestamps.
        tm.tm_isdst = 0;
        auto timePoint{std::chrono::system_clock::from_time_t(UtcToTimeT(tm))};

        return User{
            row["id"].as<i32>(),
            row["username"].as<std::string>(),
            row["display_name"].as<std::string>(),
            row["email"].is_null() ? "" : row["email"].as<std::string>(),
            row["password_hash"].is_null() ? "" : row["password_hash"].as<std::string>(),
            row["is_verified"].as<bool>(),
            row["avatar_url"].is_null() ? "" : row["avatar_url"].as<std::string>(),
            row["aura"].as<i32>(),
            row["energy"].as<i32>(),
            timePoint,
            row["current_streak"].as<i32>(),
            row["longest_streak"].as<i32>(),
            row["last_login_date"].is_null() ? "" : row["last_login_date"].as<std::string>(),
            row["created_at"].as<std::string>()};
    }

    inline AuthToken MapAuthToken(const pqxx::row& row)
    {
        return AuthToken{
            row["id"].as<i32>(),
            row["user_id"].as<i32>(),
            row["token"].as<std::string>(),
            row["type"].as<std::string>(),
            row["expires_at"].as<std::string>(),
            row["used_at"].is_null() ? "" : row["used_at"].as<std::string>(),
            row["created_at"].as<std::string>()};
    }

    inline OAuthAccount MapOAuthAccount(const pqxx::row& row)
    {
        return OAuthAccount{
            row["id"].as<i32>(),
            row["user_id"].as<i32>(),
            row["provider"].as<std::string>(),
            row["provider_id"].as<std::string>()};
    }

    inline Level MapLevel(const pqxx::row& row)
    {
        return Level{
            row["id"].as<i32>(),
            row["level_number"].as<i32>(),
            row["title"].as<std::string>(),
            row["content_md"].as<std::string>(),
            row["energy_cost"].as<i32>(),
            row["quiz_aura_reward"].as<i32>(),
            row["is_published"].as<bool>()};
    }

    inline std::vector<Level> MapLevels(const pqxx::result& result)
    {
        std::vector<Level> levels;
        levels.reserve(result.size());

        for (const auto& row : result)
        {
            levels.emplace_back(MapLevel(row));
        }

        return levels;
    }

    inline EnergyLog MapEnergyLog(const pqxx::row& row)
    {
        return EnergyLog{
            row["id"].as<i32>(),
            row["user_id"].as<i32>(),
            row["delta"].as<i32>(),
            row["reason"].as<std::string>(),
            row["created_at"].as<std::string>()};
    }

    inline std::vector<EnergyLog> MapEnergyLogs(const pqxx::result& result)
    {
        std::vector<EnergyLog> energyLogs;
        energyLogs.reserve(result.size());

        for (const auto& row : result)
        {
            energyLogs.emplace_back(MapEnergyLog(row));
        }

        return energyLogs;
    }

    inline QuizOption MapQuizOption(const pqxx::row& row)
    {
        return QuizOption{
            row["id"].as<i32>(),
            row["question_id"].as<i32>(),
            row["option_text"].as<std::string>(),
            row["is_correct"].as<bool>()};
    }

    inline std::vector<QuizOption> MapQuizOptions(const pqxx::result& result)
    {
        std::vector<QuizOption> options;
        options.reserve(result.size());

        for (const auto& row : result)
        {
            options.emplace_back(MapQuizOption(row));
        }

        return options;
    }

    inline QuizQuestion MapQuizQuestion(const pqxx::row& row)
    {
        return QuizQuestion{
            row["id"].as<i32>(),
            row["level_id"].as<i32>(),
            row["question_text"].as<std::string>(),
            row["explanation"].is_null() ? "" : row["explanation"].as<std::string>(),
            row["order_index"].as<i32>(),
            {}};
    }

    inline std::vector<QuizQuestion> MapQuizQuestions(const pqxx::result& result)
    {
        std::vector<QuizQuestion> questions;
        questions.reserve(result.size());

        for (const auto& row : result)
        {
            questions.emplace_back(MapQuizQuestion(row));
        }

        return questions;
    }

    inline UserLevelProgress MapUserLevelProgress(const pqxx::row& row)
    {
        return UserLevelProgress{
            row["is_unlocked"].as<bool>(),
            row["is_completed"].as<bool>(),
            row["quiz_score"].is_null() ? 0 : row["quiz_score"].as<i32>(),
            row["attempts"].as<i32>(),
            row["completed_at"].is_null() ? "" : row["completed_at"].as<std::string>()};
    }

    inline TestCase MapTestCase(const pqxx::row& row)
    {
        return TestCase{
            row["id"].as<i32>(),
            row["problem_id"].as<i32>(),
            row["input"].as<std::string>(),
            row["expected_output"].as<std::string>(),
            row["explanation_md"].is_null() ? "" : row["explanation_md"].as<std::string>(),
            row["is_hidden"].as<bool>(),
            row["order_index"].as<i32>()};
    }

    inline std::vector<TestCase> MapTestCases(const pqxx::result& result)
    {
        std::vector<TestCase> testCases;
        testCases.reserve(result.size());
        for (const auto& row : result)
            testCases.emplace_back(MapTestCase(row));
        return testCases;
    }

    inline Problem MapProblem(const pqxx::row& row)
    {
        return Problem{
            row["id"].as<i32>(),
            row["title"].as<std::string>(),
            row["slug"].as<std::string>(),
            row["description_md"].as<std::string>(),
            row["constraints_md"].is_null() ? "" : row["constraints_md"].as<std::string>(),
            row["starter_code"].as<std::string>(),
            row["tags"].as<std::string>(),
            row["difficulty"].as<std::string>(),
            row["energy_cost"].as<i32>(),
            row["aura_reward"].as<i32>(),
            row["is_published"].as<bool>(),
            row["created_at"].as<std::string>()};
    }

    inline std::vector<Problem> MapProblems(const pqxx::result& result)
    {
        std::vector<Problem> problems;
        problems.reserve(result.size());
        for (const auto& row : result)
            problems.emplace_back(MapProblem(row));
        return problems;
    }

    inline Submission MapSubmission(const pqxx::row& row)
    {
        return Submission{
            row["id"].as<i32>(),
            row["user_id"].as<i32>(),
            row["problem_id"].as<i32>(),
            row["code"].as<std::string>(),
            row["status"].as<std::string>(),
            row["runtime_ms"].is_null() ? 0 : row["runtime_ms"].as<i32>(),
            row["memory_kb"].is_null() ? 0 : row["memory_kb"].as<i32>(),
            row["error_output"].is_null() ? "" : row["error_output"].as<std::string>(),
            row["submitted_at"].as<std::string>()};
    }

    inline std::vector<Submission> MapSubmissions(const pqxx::result& result)
    {
        std::vector<Submission> submissions;
        submissions.reserve(result.size());
        for (const auto& row : result)
            submissions.emplace_back(MapSubmission(row));
        return submissions;
    }
} // namespace CLingo::Model
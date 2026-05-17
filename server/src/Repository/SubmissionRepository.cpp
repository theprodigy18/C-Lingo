// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "SubmissionRepository.hpp"

#include <Model/DatabaseToModelMapper.hpp>

namespace CLingo
{
    i32 SubmissionRepository::Create(PooledConnection& conn, i32 userId, i32 problemId, const std::string& code)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                INSERT INTO submissions(user_id, problem_id, code, status)
                                VALUES ($1, $2, $3, 'pending')
                                RETURNING id
                                )",
                                pqxx::params{userId, problemId, code})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to create submission");

        return result[0]["id"].as<i32>();
    }

    std::vector<Model::Submission> SubmissionRepository::FindByUserAndProblem(PooledConnection& conn, i32 userId, i32 problemId)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                SELECT id, user_id, problem_id, code, status, runtime_ms, memory_kb, error_output, submitted_at
                                FROM submissions
                                WHERE user_id = $1 AND problem_id = $2
                                ORDER BY submitted_at DESC
                                )",
                                pqxx::params{userId, problemId})};

        std::vector<Model::Submission> submissions;
        submissions.reserve(result.size());

        for (const auto& row : result)
        {
            submissions.push_back(Model::Submission{
                row["id"].as<i32>(),
                row["user_id"].as<i32>(),
                row["problem_id"].as<i32>(),
                row["code"].as<std::string>(),
                row["status"].as<std::string>(),
                row["runtime_ms"].is_null() ? 0.0 : row["runtime_ms"].as<f64>(),
                row["memory_kb"].is_null() ? 0.0 : row["memory_kb"].as<f64>(),
                row["error_output"].is_null() ? "" : row["error_output"].as<std::string>(),
                row["submitted_at"].as<std::string>()});
        }

        return submissions;
    }

    std::vector<Model::LeaderboardEntryWithCategory> SubmissionRepository::FindLeaderboardByProblem(PooledConnection& conn, i32 problemId, i32 limit)
    {
        pqxx::read_transaction txn{conn.Get()};

        // Get best submission per user per category
        // 1 query dengan UNION ALL untuk kedua category
        auto result{txn.exec_params(R"(
                                WITH ranked AS (
                                    SELECT
                                        s.user_id,
                                        u.username,
                                        u.display_name,
                                        s.runtime_ms,
                                        s.memory_kb,
                                        s.submitted_at,
                                        ROW_NUMBER() OVER (PARTITION BY s.user_id ORDER BY s.runtime_ms ASC NULLS LAST) as rn_runtime,
                                        ROW_NUMBER() OVER (PARTITION BY s.user_id ORDER BY s.memory_kb ASC NULLS LAST) as rn_memory
                                    FROM submissions s
                                    JOIN users u ON s.user_id = u.id
                                    WHERE s.problem_id = $1 AND s.status = 'accepted'
                                ),
                                runtime_entries AS (
                                    SELECT user_id, username, display_name, runtime_ms as value, submitted_at
                                    FROM ranked
                                    WHERE rn_runtime = 1
                                ),
                                memory_entries AS (
                                    SELECT user_id, username, display_name, memory_kb as value, submitted_at
                                    FROM ranked
                                    WHERE rn_memory = 1
                                )
                                SELECT user_id, username, display_name, value, submitted_at, 'runtime' as category
                                FROM runtime_entries
                                UNION ALL
                                SELECT user_id, username, display_name, value, submitted_at, 'memory' as category
                                FROM memory_entries
                                ORDER BY category, value ASC
                                LIMIT $2
                                )",
                                    pqxx::params{problemId, limit})};

        return Model::MapLeaderboardEntriesWithCategory(result);
    }
} // namespace CLingo

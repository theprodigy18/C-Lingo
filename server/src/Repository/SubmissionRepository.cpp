// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "SubmissionRepository.hpp"

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

    void SubmissionRepository::UpdateStatus(PooledConnection& conn, i32 submissionId, const std::string& status, i32 runtimeMs, i32 memoryKb, const std::string& errorOutput)
    {
        pqxx::work txn{conn.Get()};

        txn.exec_params(R"(
                                UPDATE submissions
                                SET status = $2, runtime_ms = $3, memory_kb = $4, error_output = $5
                                WHERE id = $1
                                )",
                                pqxx::params{submissionId, status, runtimeMs, memoryKb, errorOutput});

        txn.commit();
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
                row["runtime_ms"].is_null() ? 0 : row["runtime_ms"].as<i32>(),
                row["memory_kb"].is_null() ? 0 : row["memory_kb"].as<i32>(),
                row["error_output"].is_null() ? "" : row["error_output"].as<std::string>(),
                row["submitted_at"].as<std::string>()});
        }

        return submissions;
    }
} // namespace CLingo

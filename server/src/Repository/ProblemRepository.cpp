// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "ProblemRepository.hpp"

#include <Model/DatabaseToModelMapper.hpp>

namespace CLingo
{
    std::vector<Model::Problem> ProblemRepository::FindAllPublished(PooledConnection& conn)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec(R"(
                            SELECT id, title, slug, description_md, constraints_md, starter_code, tags, difficulty, energy_cost, aura_reward, is_published, created_at
                            FROM problems
                            WHERE is_published = TRUE
                            ORDER BY difficulty, title
                            )")};

        return Model::MapProblems(result);
    }

    std::optional<Model::Problem> ProblemRepository::FindById(PooledConnection& conn, i32 problemId)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                            SELECT id, title, slug, description_md, constraints_md, starter_code, tags, difficulty, energy_cost, aura_reward, is_published, created_at
                            FROM problems
                            WHERE id = $1
                            )",
                                    pqxx::params{problemId})};

        if (result.empty())
            return std::nullopt;

        return Model::MapProblem(result[0]);
    }

    std::vector<Model::TestCase> ProblemRepository::FindTestCasesByProblemId(PooledConnection& conn, i32 problemId, bool includeHidden)
    {
        pqxx::read_transaction txn{conn.Get()};

        std::string query;
        if (includeHidden)
        {
            query = R"(
                SELECT id, problem_id, input, expected_output, explanation_md, is_hidden, order_index
                FROM test_cases
                WHERE problem_id = $1
                ORDER BY order_index ASC
            )";
        }
        else
        {
            query = R"(
                SELECT id, problem_id, input, expected_output, explanation_md, is_hidden, order_index
                FROM test_cases
                WHERE problem_id = $1 AND is_hidden = FALSE
                ORDER BY order_index ASC
            )";
        }

        auto result{txn.exec_params(query, pqxx::params{problemId})};

        return Model::MapTestCases(result);
    }
} // namespace CLingo

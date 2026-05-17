// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Database/PooledConnection.hpp>
#include <Model/Problem.hpp>

namespace CLingo
{
    class ProblemRepository
    {
    public:
        std::vector<Model::Problem> FindAllPublished(PooledConnection& conn);
        std::optional<Model::Problem> FindById(PooledConnection& conn, i32 problemId);
        std::vector<Model::TestCase> FindTestCasesByProblemId(PooledConnection& conn, i32 problemId, bool includeHidden);
    };
} // namespace CLingo

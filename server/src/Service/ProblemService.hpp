// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Database/PooledConnection.hpp>
#include <Repository/ProblemRepository.hpp>
#include <Dto/Problem/ProblemListResponse.hpp>
#include <Dto/Problem/ProblemDetailResponse.hpp>

namespace CLingo
{
    class ProblemService
    {
    public:
        explicit ProblemService(ProblemRepository& problemRepository);

        Dto::ProblemListResponse GetProblemList(PooledConnection& conn);
        Dto::ProblemDetailResponse GetProblemDetail(PooledConnection& conn, i32 problemId, bool includeHidden = false);

    private:
        ProblemRepository& m_ProblemRepo;
    };
} // namespace CLingo

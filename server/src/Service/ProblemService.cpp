// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "ProblemService.hpp"

#include <Dto/ModelToDtoParser.hpp>

namespace CLingo
{
    ProblemService::ProblemService(ProblemRepository& problemRepository)
        : m_ProblemRepo{problemRepository} {}

    Dto::ProblemListResponse ProblemService::GetProblemList(PooledConnection& conn)
    {
        auto problems = m_ProblemRepo.FindAllPublished(conn);
        return Dto::ProblemListResponse{Dto::ProblemsToListItems(problems)};
    }

    Dto::ProblemDetailResponse ProblemService::GetProblemDetail(PooledConnection& conn, i32 problemId, bool includeHidden)
    {
        auto problem = m_ProblemRepo.FindById(conn, problemId);
        if (!problem)
            return {Dto::ProblemDetail{}, false};

        auto testCases = m_ProblemRepo.FindTestCasesByProblemId(conn, problemId, includeHidden);
        return Dto::ProblemDetailResponse{
            Dto::ProblemToDetail(*problem, testCases),
            true};
    }
} // namespace CLingo

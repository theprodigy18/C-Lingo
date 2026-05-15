// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "SubmissionService.hpp"

#include <Dto/ModelToDtoParser.hpp>

namespace CLingo
{
    SubmissionService::SubmissionService(SubmissionRepository& submissionRepository)
        : m_SubmissionRepo{submissionRepository} {}

    i32 SubmissionService::CreateSubmission(PooledConnection& conn, i32 userId, i32 problemId, const std::string& code)
    {
        return m_SubmissionRepo.Create(conn, userId, problemId, code);
    }

    Dto::SubmissionListResponse SubmissionService::GetSubmissions(PooledConnection& conn, i32 userId, i32 problemId)
    {
        auto submissions = m_SubmissionRepo.FindByUserAndProblem(conn, userId, problemId);
        return Dto::SubmissionListResponse{Dto::SubmissionsToItems(submissions)};
    }
} // namespace CLingo

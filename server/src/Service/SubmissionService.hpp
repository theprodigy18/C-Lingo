// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Database/PooledConnection.hpp>
#include <Repository/SubmissionRepository.hpp>
#include <Dto/Problem/SubmissionListResponse.hpp>

namespace CLingo
{
    class SubmissionService
    {
    public:
        explicit SubmissionService(SubmissionRepository& submissionRepository);

        i32 CreateSubmission(PooledConnection& conn, i32 userId, i32 problemId, const std::string& code);
        Dto::SubmissionListResponse GetSubmissions(PooledConnection& conn, i32 userId, i32 problemId);

    private:
        SubmissionRepository& m_SubmissionRepo;
    };
} // namespace CLingo

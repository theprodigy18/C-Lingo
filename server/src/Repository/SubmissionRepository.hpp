// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Database/PooledConnection.hpp>
#include <Model/Submission.hpp>

namespace CLingo
{
    class SubmissionRepository
    {
    public:
        i32 Create(PooledConnection& conn, i32 userId, i32 problemId, const std::string& code);
        void UpdateStatus(PooledConnection& conn, i32 submissionId, const std::string& status, i32 runtimeMs, i32 memoryKb, const std::string& errorOutput);
        std::vector<Model::Submission> FindByUserAndProblem(PooledConnection& conn, i32 userId, i32 problemId);
    };
} // namespace CLingo

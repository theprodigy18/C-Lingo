// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Database/PooledConnection.hpp>
#include <Model/AuraLog.hpp>

namespace CLingo
{
    class AuraLogRepository
    {
    public:
        void AddAuraLog(PooledConnection& conn, i32 userId, i32 delta, const std::string& reason, i32 refId, const std::string& refType);
        bool HasRewardForRef(PooledConnection& conn, i32 userId, i32 refId, const std::string& refType);
    };
} // namespace CLingo
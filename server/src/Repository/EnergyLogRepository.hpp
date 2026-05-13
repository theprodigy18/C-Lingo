// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Database/PooledConnection.hpp>
#include <Model/EnergyLog.hpp>

namespace CLingo
{
    class EnergyLogRepository
    {
    public:
        void AddEnergyLog(PooledConnection& conn, i32 userId, i32 delta, const std::string& reason);
        std::vector<Model::EnergyLog> GetEnergyLogs(PooledConnection& conn, i32 userId);
    };
} // namespace CLingo
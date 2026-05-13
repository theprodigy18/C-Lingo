// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "EnergyLogRepository.hpp"

#include <Model/DatabaseToModelMapper.hpp>

namespace CLingo
{
    void EnergyLogRepository::AddEnergyLog(PooledConnection& conn, i32 userId, i32 delta, const std::string& reason)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                INSERT INTO energy_logs(user_id, delta, reason)
                                VALUES($1, $2, $3)
                                RETURNING id
                                )",
                                    pqxx::params{userId, delta, reason})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to add energy log");
    }

    std::vector<Model::EnergyLog> EnergyLogRepository::GetEnergyLogs(PooledConnection& conn, i32 userId)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                SELECT id, user_id, delta, reason, created_at
                                FROM energy_logs
                                WHERE user_id = $1
                                ORDER BY created_at DESC
                                )",
                                    pqxx::params{userId})};

        return Model::MapEnergyLogs(result);
    }

} // namespace CLingo
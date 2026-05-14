// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "AuraLogRepository.hpp"

#include <Model/DatabaseToModelMapper.hpp>

namespace CLingo
{
    void AuraLogRepository::AddAuraLog(PooledConnection& conn, i32 userId, i32 delta, const std::string& reason, i32 refId, const std::string& refType)
    {
        pqxx::work txn{conn.Get()};

        auto result{txn.exec_params(R"(
                                INSERT INTO aura_logs(user_id, delta, reason, ref_id, ref_type)
                                VALUES($1, $2, $3, $4, $5)
                                RETURNING id
                                )",
                                    pqxx::params{userId, delta, reason, refId, refType})};

        txn.commit();

        if (result.empty())
            throw InternalError("Failed to add aura log");
    }
} // namespace CLingo
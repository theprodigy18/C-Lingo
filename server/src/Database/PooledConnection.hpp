// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include "ConnectionPool.hpp"

namespace CLingo
{
    // RAII wrapper for pooled database connections.
    class PooledConnection
    {
    public:
        explicit PooledConnection(ConnectionPool& pool);
        ~PooledConnection();

        pqxx::connection& Get();

    private:
        // Reference to the originating pool
        ConnectionPool& m_Pool;
        // Owned connection instance acquired from the pool
        std::unique_ptr<pqxx::connection> m_Conn;
    };
} // namespace CLingo
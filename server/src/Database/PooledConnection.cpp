// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "PooledConnection.hpp"

namespace CLingo
{
    PooledConnection::PooledConnection(ConnectionPool& pool)
        : m_Pool(pool), m_Conn(m_Pool.Acquire()) {}

    PooledConnection::~PooledConnection()
    {
        m_Pool.Release(std::move(m_Conn));
    }

    pqxx::connection& PooledConnection::Get()
    {
        return *m_Conn;
    }
} // namespace CLingo
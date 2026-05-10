// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "ConnectionPool.hpp"

namespace CLingo
{
    ConnectionPool::ConnectionPool(
        std::string connStr,
        int connPoolSize,
        std::chrono::seconds timeout /* = std::chrono::seconds(5) */)
        : m_ConnString(connStr), m_Timeout(timeout)
    {
        // Preallocates a fixed number of database connections using the provided connection string
        for (int i = 0; i < connPoolSize; ++i)
        {
            m_Pool.push(std::make_unique<pqxx::connection>(m_ConnString));
        }
    }

    std::unique_ptr<pqxx::connection> ConnectionPool::Acquire()
    {
        std::unique_lock<std::mutex> lock{m_Mutex};

        bool available{m_Cv.wait_for(
            lock,
            m_Timeout,
            [this] { return !m_Pool.empty(); })};

        if (!available)
        {
            throw InternalError("Connection pool timed out");
        }

        auto conn{std::move(m_Pool.front())};
        m_Pool.pop();

        return conn;
    }

    void ConnectionPool::Release(std::unique_ptr<pqxx::connection> conn)
    {
        std::lock_guard<std::mutex> lock{m_Mutex};

        if (conn && conn->is_open())
        {
            m_Pool.push(std::move(conn));
        }
        else
        {
            // Attempt to restore pool capacity by reconnecting
            try
            {
                LOG_ERROR("Connection is not open, trying to reconnect");
                m_Pool.push(std::make_unique<pqxx::connection>(m_ConnString));
            }
            catch (const std::exception& e)
            {
                // Reconnection failure leaves the pool temporarily undersized
                std::string message{"Error reconnecting to database: " + std::string(e.what())};
                LOG_CRITICAL(message);
            }
        }

        // Notify one waiting thread that a connection may be available
        m_Cv.notify_one();
    }
} // namespace CLingo
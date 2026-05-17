// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <mutex>
#include <condition_variable>

#include <pqxx/pqxx>

namespace CLingo
{
    class ConnectionPool
    {
    public:
        ConnectionPool(
            std::string connStr,
            int connPoolSize,
            std::chrono::seconds timeout = std::chrono::seconds(5));

        std::unique_ptr<pqxx::connection> Acquire();
        void Release(std::unique_ptr<pqxx::connection> conn);

    private:
        std::string m_ConnString;
        std::chrono::seconds m_Timeout; // Maximum wait duration for Acquire()
        std::queue<std::unique_ptr<pqxx::connection>> m_Pool;

        // Synchronization primitives for thread-safe access
        std::mutex m_Mutex;
        std::condition_variable m_Cv;
    };
} // namespace CLingo
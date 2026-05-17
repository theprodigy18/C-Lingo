// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <shared_mutex>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <atomic>

namespace CLingo
{
    /**
     * Centralized cleanup manager for all instances that need to be cleaned periodically.
     * Runs a single background thread that periodically triggers
     * cleanup callbacks registered by each instance.
     */
    class CleanupManager
    {
    public:
        CleanupManager(std::chrono::seconds cleanupInterval = std::chrono::seconds(300))
            : m_Stop{false}
        {
            m_Thread = std::thread([this, cleanupInterval]() {
                while (!m_Stop)
                {
                    // Wait for interval or until notify when shutdown
                    std::unique_lock<std::mutex> lock{m_CvMutex};
                    m_Cv.wait_for(lock, cleanupInterval, [this] { return m_Stop.load(); });

                    if (!m_Stop)
                        RunCleanups();
                }
            });
        }

        ~CleanupManager()
        {
            {
                std::unique_lock<std::mutex> lock{m_CvMutex};
                m_Stop = true;
            }
            m_Cv.notify_all(); // wake up thread
            if (m_Thread.joinable())
                m_Thread.join();
        }

        // Non-copyable
        CleanupManager(const CleanupManager&) = delete;
        CleanupManager& operator=(const CleanupManager&) = delete;

        // All instances that need cleanup periodically must call this to register their cleanup callbacks
        void Register(std::function<void()> cleanupFn)
        {
            std::unique_lock<std::shared_mutex> lock{m_Mutex};
            m_CleanupCallbacks.push_back(std::move(cleanupFn));
        }

    private:
        void RunCleanups()
        {
            std::shared_lock<std::shared_mutex> lock{m_Mutex};
            for (auto& fn : m_CleanupCallbacks)
                fn();
        }

    private:
        std::vector<std::function<void()>> m_CleanupCallbacks;
        mutable std::shared_mutex m_Mutex;

        std::thread m_Thread;
        std::atomic<bool> m_Stop;
        std::condition_variable m_Cv;
        std::mutex m_CvMutex; // m_Cv need std::mutex, not std::shared_mutex
    };
} // namespace CLingo
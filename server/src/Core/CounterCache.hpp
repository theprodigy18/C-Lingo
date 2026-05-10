// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Util/Cache.hpp>

namespace CLingo
{
    class CounterCache
    {
    public:
        CounterCache() = default;
        ~CounterCache() = default;

        // Non-copyable, non-movable
        CounterCache(const CounterCache&) = delete;
        CounterCache& operator=(const CounterCache&) = delete;
        CounterCache(CounterCache&&) = delete;
        CounterCache& operator=(CounterCache&&) = delete;

        void Increment(const std::string& key, std::chrono::seconds window)
        {
            std::unique_lock<std::shared_mutex> lock{m_Mutex};
            auto it{m_Store.find(key)};

            if (it == m_Store.end() || IsExpired(it->second))
            {
                m_Store[key] = {1, std::chrono::steady_clock::now(), window};
                return;
            }

            it->second.count++;
        }

        i32 Get(const std::string& key)
        {
            std::shared_lock<std::shared_mutex> lock{m_Mutex};
            auto it{m_Store.find(key)};

            if (it == m_Store.end() || IsExpired(it->second))
                return 0;

            return it->second.count;
        }

        bool IsLimited(const std::string& key, i32 limit)
        {
            return Get(key) >= limit;
        }

        void Reset(const std::string& key)
        {
            std::unique_lock<std::shared_mutex> lock{m_Mutex};
            m_Store.erase(key);
        }

        void Cleanup()
        {
            std::unique_lock<std::shared_mutex> lock{m_Mutex};
            for (auto it{m_Store.begin()}; it != m_Store.end();)
            {
                if (IsExpired(it->second))
                    it = m_Store.erase(it);
                else
                    ++it;
            }
        }

        uSize Size()
        {
            std::shared_lock<std::shared_mutex> lock{m_Mutex};
            return m_Store.size();
        }

    private:
        struct Entry
        {
            i32 count;
            std::chrono::steady_clock::time_point insertedAt;
            std::chrono::seconds window;
        };

        bool IsExpired(const Entry& entry) const
        {
            return std::chrono::steady_clock::now() - entry.insertedAt > entry.window;
        }

    private:
        std::unordered_map<std::string, Entry> m_Store;
        mutable std::shared_mutex m_Mutex;
    };
} // namespace CLingo
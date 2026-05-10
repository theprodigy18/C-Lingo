// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <mutex>
#include <shared_mutex>

namespace CLingo
{
    template <typename Key, typename Value>
    class Cache
    {
    public:
        explicit Cache(std::chrono::seconds ttl)
            : m_Ttl(ttl) {}

        // Non-copyable and non-movable because of mutex
        Cache(const Cache&) = delete;
        Cache& operator=(const Cache&) = delete;
        Cache(Cache&&) = delete;
        Cache& operator=(Cache&&) = delete;

        void Set(Key key, Value value)
        {
            std::unique_lock<std::shared_mutex> lock{m_Mutex};
            m_Store[std::move(key)] = {std::move(value), std::chrono::steady_clock::now()};
        }

        std::optional<Value> Get(const Key& key)
        {
            // Try read lock
            {
                std::shared_lock<std::shared_mutex> lock{m_Mutex};
                auto it{m_Store.find(key)};
                if (it == m_Store.end())
                    return std::nullopt;

                if (!IsExpired(it->second))
                    return it->second.value;
            }

            // Expired = write lock
            {
                std::unique_lock<std::shared_mutex> lock{m_Mutex};
                auto it{m_Store.find(key)};
                // Double check after acquiring write lock
                if (it != m_Store.end() && IsExpired(it->second))
                    m_Store.erase(it);
            }

            return std::nullopt;
        }

        void Invalidate(const Key& key)
        {
            std::unique_lock<std::shared_mutex> lock(m_Mutex);
            m_Store.erase(key);
        }

        void Clear()
        {
            std::unique_lock<std::shared_mutex> lock(m_Mutex);
            m_Store.clear();
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
            return m_Store.size(); // Approximate, including expired entries
        }

    private:
        struct Entry
        {
            Value value;
            std::chrono::steady_clock::time_point insertedAt;
        };

        bool IsExpired(const Entry& entry) const
        {
            return std::chrono::steady_clock::now() - entry.insertedAt > m_Ttl;
        }

    private:
        std::chrono::seconds m_Ttl;
        std::unordered_map<Key, Entry> m_Store;
        mutable std::shared_mutex m_Mutex;
    };
} // namespace CLingo
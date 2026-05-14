// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Util/Cache.hpp>
#include <Model/Level.hpp>

namespace CLingo
{
    class LevelCache
    {
    public:
        LevelCache(std::chrono::seconds ttl = std::chrono::hours(24))
            : m_Cache{ttl} {}

        void Set(Model::Level level)
        {
            m_Cache.Set(level.id, std::move(level));
        }

        std::optional<Model::Level> Get(i32 levelId)
        {
            return m_Cache.Get(levelId);
        }

        void SetPublishedIds(std::vector<i32> ids)
        {
            m_PublishedIds = std::move(ids);
        }

        const std::vector<i32>& GetPublishedIds() const
        {
            return m_PublishedIds;
        }

        void Invalidate()
        {
            m_Cache.Clear();
            m_PublishedIds.clear();
        }

        void Cleanup()
        {
            m_Cache.Cleanup();
        }

    private:
        Cache<i32, Model::Level> m_Cache;
        std::vector<i32> m_PublishedIds;
    };
} // namespace CLingo
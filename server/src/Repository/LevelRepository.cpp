// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "LevelRepository.hpp"

#include <unordered_set>

#include <Model/DatabaseToModelMapper.hpp>

namespace CLingo
{
    LevelRepository::LevelRepository(LevelCache& levelCache)
        : m_LevelCache{levelCache} {}

    std::vector<Model::Level> LevelRepository::FindAllPublished(PooledConnection& conn)
    {
        const auto& cachedIds{m_LevelCache.GetPublishedIds()};

        if (!cachedIds.empty())
        {
            std::vector<Model::Level> levels;
            levels.reserve(cachedIds.size());
            for (const auto id : cachedIds)
            {
                auto level{m_LevelCache.Get(id)};
                if (level)
                    levels.push_back(*level);
            }
            return levels;
        }

        // Load into cache
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec(R"(
                            SELECT id, level_number, title, content_md, energy_cost, quiz_aura_reward, is_published
                            FROM levels
                            WHERE is_published = TRUE
                            ORDER BY level_number ASC
                            )")};

        std::vector<Model::Level> levels{Model::MapLevels(result)};

        std::vector<i32> ids;
        ids.reserve(levels.size());
        for (const auto& level : levels)
        {
            m_LevelCache.Set(level);
            ids.push_back(level.id);
        }
        m_LevelCache.SetPublishedIds(std::move(ids));

        return levels;
    }

    std::optional<Model::Level> LevelRepository::FindById(PooledConnection& conn, i32 levelId)
    {
        auto cached{m_LevelCache.Get(levelId)};
        if (cached)
            return *cached;

        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                            SELECT id, level_number, title, content_md, energy_cost, quiz_aura_reward, is_published
                            FROM levels
                            WHERE id = $1
                            )",
                                    pqxx::params{levelId})};

        if (result.empty())
            return std::nullopt;

        auto level{Model::MapLevel(result[0])};
        m_LevelCache.Set(level);

        return level;
    }

    std::vector<std::pair<i32, bool>> LevelRepository::FindProgressByUserId(
        PooledConnection& conn,
        i32 userId,
        const std::vector<i32>& levelIds)
    {
        if (levelIds.empty())
            return {};

        // Build set of levelIds for quick lookup
        std::unordered_set<i32> levelIdSet;
        for (const auto id : levelIds)
            levelIdSet.insert(id);

        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                            SELECT level_id, is_completed
                            FROM user_level_progress
                            WHERE user_id = $1
                            )",
                                    pqxx::params{userId})};

        std::vector<std::pair<i32, bool>> progress;
        progress.reserve(result.size());

        for (const auto& row : result)
        {
            auto levelId{row["level_id"].as<i32>()};
            // Only include levels we're interested in
            if (levelIdSet.count(levelId) > 0)
            {
                progress.emplace_back(levelId, row["is_completed"].as<bool>());
            }
        }

        return progress;
    }
} // namespace CLingo
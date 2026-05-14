// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "LevelService.hpp"

#include <Util/Input.hpp>

namespace CLingo
{
    LevelService::LevelService(LevelRepository& levelRepository)
        : m_LevelRepo{levelRepository} {}

    Dto::LevelListResponse LevelService::GetLevels(PooledConnection& conn, i32 userId)
    {
        // Get all published levels
        auto levels{m_LevelRepo.FindAllPublished(conn)};

        if (levels.empty())
            return Dto::LevelListResponse{{}};

        // Extract level IDs
        std::vector<i32> levelIds;
        levelIds.reserve(levels.size());
        for (const auto& level : levels)
        {
            levelIds.push_back(level.id);
        }

        // Get progress for these levels
        auto progressPairs{m_LevelRepo.FindProgressByUserId(conn, userId, levelIds)};

        // Convert to map for easy lookup
        std::unordered_map<i32, bool> progressMap;
        for (const auto& [levelId, isCompleted] : progressPairs)
        {
            progressMap[levelId] = isCompleted;
        }

        // Build response with unlock logic
        std::vector<Dto::LevelListItem> items;
        items.reserve(levels.size());

        for (uSize i{0}; i < levels.size(); ++i)
        {
            const auto& level = levels[i];

            // Unlock logic:
            // - Level 1 is always unlocked
            // - Level N is unlocked if Level N-1 is completed
            bool isUnlocked = (i == 0); // First level always unlocked

            if (i > 0)
            {
                const auto& prevLevel = levels[i - 1];
                auto it = progressMap.find(prevLevel.id);
                isUnlocked = (it != progressMap.end() && it->second);
            }

            bool isCompleted = false;
            auto it = progressMap.find(level.id);
            if (it != progressMap.end())
            {
                isCompleted = it->second;
            }

            items.push_back(Dto::LevelListItem{
                level.id,
                level.levelNumber,
                level.title,
                level.energyCost,
                level.quizAuraReward,
                isUnlocked,
                isCompleted});
        }

        return Dto::LevelListResponse{std::move(items)};
    }
} // namespace CLingo
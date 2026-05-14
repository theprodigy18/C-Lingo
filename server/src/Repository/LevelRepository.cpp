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

    std::vector<Model::QuizQuestion> LevelRepository::FindQuestionsByLevelId(PooledConnection& conn, i32 levelId)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                            SELECT id, level_id, question_text, explanation, order_index
                            FROM quiz_questions
                            WHERE level_id = $1
                            ORDER BY order_index ASC, id ASC
                            )",
                                    pqxx::params{levelId})};

        return Model::MapQuizQuestions(result);
    }

    std::vector<Model::QuizOption> LevelRepository::FindOptionsByQuestionIds(
        PooledConnection& conn,
        const std::vector<i32>& questionIds)
    {
        if (questionIds.empty())
            return {};

        pqxx::read_transaction txn{conn.Get()};

        std::string placeholders;
        for (size_t i = 0; i < questionIds.size(); ++i)
        {
            placeholders += (i > 0 ? ", " : "") + std::to_string(questionIds[i]);
        }

        auto result{txn.exec(
            "SELECT id, question_id, option_text, is_correct "
            "FROM quiz_options "
            "WHERE question_id IN (" + placeholders + ") "
            "ORDER BY id ASC")};

        return Model::MapQuizOptions(result);
    }

    std::optional<Model::QuizOption> LevelRepository::FindCorrectOption(PooledConnection& conn, i32 questionId)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                            SELECT id, question_id, option_text, is_correct
                            FROM quiz_options
                            WHERE question_id = $1 AND is_correct = TRUE
                            LIMIT 1
                            )",
                                    pqxx::params{questionId})};

        if (result.empty())
            return std::nullopt;

        return Model::MapQuizOption(result[0]);
    }

    std::optional<Model::UserLevelProgress> LevelRepository::FindUserProgress(
        PooledConnection& conn,
        i32 userId,
        i32 levelId)
    {
        pqxx::read_transaction txn{conn.Get()};

        auto result{txn.exec_params(R"(
                            SELECT is_unlocked, is_completed, quiz_score, attempts, completed_at
                            FROM user_level_progress
                            WHERE user_id = $1 AND level_id = $2
                            )",
                                    pqxx::params{userId, levelId})};

        if (result.empty())
            return std::nullopt;

        return Model::MapUserLevelProgress(result[0]);
    }

    void LevelRepository::UpsertUserProgress(
        PooledConnection& conn,
        i32 userId,
        i32 levelId,
        i32 quizScore,
        bool isCompleted)
    {
        pqxx::work txn{conn.Get()};

        txn.exec_params(R"(
            INSERT INTO user_level_progress (user_id, level_id, is_unlocked, is_completed, quiz_score, attempts, completed_at)
            VALUES ($1, $2, TRUE, $3, $4, 0, NULL)
            ON CONFLICT (user_id, level_id) DO UPDATE SET
                quiz_score = CASE WHEN $4 > user_level_progress.quiz_score THEN $4 ELSE user_level_progress.quiz_score END,
                is_completed = user_level_progress.is_completed OR $3,
                attempts = user_level_progress.attempts + 1,
                completed_at = CASE WHEN $3 AND NOT user_level_progress.is_completed THEN NOW() ELSE user_level_progress.completed_at END
            )",
                pqxx::params{userId, levelId, isCompleted, quizScore});

        txn.commit();
    }
} // namespace CLingo
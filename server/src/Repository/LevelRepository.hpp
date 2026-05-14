// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Core/LevelCache.hpp>
#include <Database/PooledConnection.hpp>
#include <Model/Level.hpp>

namespace CLingo
{
    class LevelRepository
    {
    public:
        explicit LevelRepository(LevelCache& levelCache);

        std::vector<Model::Level> FindAllPublished(PooledConnection& conn);
        std::optional<Model::Level> FindById(PooledConnection& conn, i32 levelId);
        std::vector<std::pair<i32, bool>> FindProgressByUserId(PooledConnection& conn, i32 userId, const std::vector<i32>& levelIds);

        std::vector<Model::QuizQuestion> FindQuestionsByLevelId(PooledConnection& conn, i32 levelId);
        std::vector<Model::QuizOption> FindOptionsByQuestionIds(PooledConnection& conn, const std::vector<i32>& questionIds);
        std::optional<Model::QuizOption> FindCorrectOption(PooledConnection& conn, i32 questionId);

        std::optional<Model::UserLevelProgress> FindUserProgress(PooledConnection& conn, i32 userId, i32 levelId);
        void UpsertUserProgress(PooledConnection& conn, i32 userId, i32 levelId, i32 quizScore, bool isCompleted);

    private:
        LevelCache& m_LevelCache;
    };
} // namespace CLingo
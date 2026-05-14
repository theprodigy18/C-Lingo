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

    private:
        LevelCache& m_LevelCache;
    };
} // namespace CLingo
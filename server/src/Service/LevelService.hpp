// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Repository/LevelRepository.hpp>
#include <Dto/Level/LevelListResponse.hpp>

namespace CLingo
{
    class LevelService
    {
    public:
        explicit LevelService(LevelRepository& levelRepository);

        Dto::LevelListResponse GetLevels(PooledConnection& conn, i32 userId);

    private:
        LevelRepository& m_LevelRepo;
    };
} // namespace CLingo
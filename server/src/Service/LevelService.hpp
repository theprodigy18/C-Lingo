// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Repository/LevelRepository.hpp>
#include <Repository/UserRepository.hpp>
#include <Repository/EnergyLogRepository.hpp>
#include <Repository/AuraLogRepository.hpp>
#include <Dto/Level/LevelListResponse.hpp>
#include <Dto/Level/LevelDetailResponse.hpp>
#include <Dto/Level/QuizSubmitRequest.hpp>
#include <Dto/Level/QuizSubmitResponse.hpp>
#include <Dto/Level/StartLevelRequest.hpp>

namespace CLingo
{
    class LevelService
    {
    public:
        explicit LevelService(LevelRepository& levelRepository, UserRepository& userRepository, EnergyLogRepository& energyLogRepository, AuraLogRepository& auraLogRepository);

        Dto::LevelListResponse GetLevels(PooledConnection& conn, i32 userId);
        Dto::LevelDetailResponse GetLevelDetail(PooledConnection& conn, i32 userId, i32 levelId);
        Dto::QuizSubmitResponse SubmitQuiz(PooledConnection& conn, i32 userId, const Dto::QuizSubmitRequest& request);
        Dto::StartLevelResponse StartLevel(PooledConnection& conn, i32 userId, const Dto::StartLevelRequest& request);

    private:
        LevelRepository& m_LevelRepo;
        UserRepository& m_UserRepo;
        EnergyLogRepository& m_EnergyLogRepo;
        AuraLogRepository& m_AuraLogRepo;
    };
} // namespace CLingo
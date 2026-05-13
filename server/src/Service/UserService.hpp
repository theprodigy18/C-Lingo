// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Repository/UserRepository.hpp>
#include <Repository/EnergyLogRepository.hpp>
#include <Dto/User/UserState.hpp>
#include <Dto/User/PrivateUser.hpp>
#include <Dto/User/EditProfileRequest.hpp>

namespace CLingo
{
    class UserService
    {
    public:
        explicit UserService(UserRepository& userRepository, EnergyLogRepository& energyLogRepository);

        std::optional<Dto::UserState> GetUserState(PooledConnection& conn, i32 userId);
        std::optional<Dto::PrivateUser> GetPrivateUser(PooledConnection& conn, i32 userId);
        void ClaimEnergy(PooledConnection& conn, i32 userId);
        void EditProfile(PooledConnection& conn, i32 userId, const Dto::EditProfileRequest& dto);

    private:
        UserRepository& m_UserRepo;
        EnergyLogRepository& m_EnergyLogRepo;
    };
} // namespace CLingo
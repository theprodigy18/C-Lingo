// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Repository/UserRepository.hpp>
#include <Dto/User/UserState.hpp>
#include <Dto/User/PrivateUser.hpp>

namespace CLingo
{
    class UserService
    {
    public:
        explicit UserService(UserRepository& userRepository);

        std::optional<Dto::UserState> GetUserState(i32 userId);
        std::optional<Dto::PrivateUser> GetPrivateUser(i32 userId);

    private:
        UserRepository& m_UserRepo;
    };
} // namespace CLingo
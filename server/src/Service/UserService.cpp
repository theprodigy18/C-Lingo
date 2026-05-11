// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "UserService.hpp"

#include <Dto/ModelToDtoParser.hpp>

namespace CLingo
{
    UserService::UserService(UserRepository& userRepository)
        : m_UserRepo(userRepository) {}

    std::optional<Dto::UserState> UserService::GetUserState(PooledConnection& conn, i32 userId)
    {
        auto user{m_UserRepo.FindById(conn, userId)};
        if (!user)
            return std::nullopt;

        return Dto::UserToUserState(*user);
    }

    std::optional<Dto::PrivateUser> UserService::GetPrivateUser(PooledConnection& conn, i32 userId)
    {
        auto user{m_UserRepo.FindById(conn, userId)};
        if (!user)
            return std::nullopt;

        return Dto::UserToPrivateUser(*user);
    }
} // namespace CLingo

// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Core/UserCache.hpp>
#include <Database/PooledConnection.hpp>
#include <Model/User.hpp>

namespace CLingo
{
    class UserRepository
    {
    public:
        explicit UserRepository(UserCache& userCache);

        std::optional<Model::User> FindById(PooledConnection& conn, i32 userId);

    private:
        UserCache& m_UserCache;
    };
} // namespace CLingo
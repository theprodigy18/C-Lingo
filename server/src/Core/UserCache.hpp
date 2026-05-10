// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <Util/Cache.hpp>
#include <Model/User.hpp>

namespace CLingo
{
    class UserCache
    {
    public:
        UserCache(std::chrono::seconds ttl = std::chrono::minutes(15))
            : m_IdCache{ttl}, m_EmailCache{ttl} {}

        void Set(const Model::User& user)
        {
            m_IdCache.Set(user.id, user);

            if (!user.email.empty())
                m_EmailCache.Set(user.email, user.id);
        }

        std::optional<Model::User> GetById(int id)
        {
            return m_IdCache.Get(id);
        }

        std::optional<Model::User> GetByEmail(const std::string& email)
        {
            auto userId{m_EmailCache.Get(email)};
            if (!userId)
                return std::nullopt;

            return m_IdCache.Get(*userId);
        }

        void Invalidate(i32 userId)
        {
            auto user{m_IdCache.Get(userId)};
            m_IdCache.Invalidate(userId);
            if (user && !user->email.empty())
                m_EmailCache.Invalidate(user->email);
        }

        void Cleanup()
        {
            m_EmailCache.Cleanup();
            m_IdCache.Cleanup();
        }

    private:
        Cache<i32, Model::User> m_IdCache;
        Cache<std::string, i32> m_EmailCache;
    };
} // namespace CLingo
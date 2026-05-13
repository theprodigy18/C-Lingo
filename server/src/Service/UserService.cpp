// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "UserService.hpp"

#include <Dto/ModelToDtoParser.hpp>
#include <Util/Input.hpp>

namespace CLingo
{
    namespace
    {
        std::string GetTodayString()
        {
            auto now{std::chrono::system_clock::now()};
            auto time{std::chrono::system_clock::to_time_t(now)};
            std::tm tm{};
#ifdef _WIN64
            gmtime_s(&tm, &time);
#else
            gmtime_r(&time, &tm);
#endif // _WIN64

            char buf[11];
            std::strftime(buf, sizeof(buf), "%Y-%m-%d", &tm);
            return std::string{buf};
        }
    } // anonymous namespace

    UserService::UserService(UserRepository& userRepository, EnergyLogRepository& energyLogRepository)
        : m_UserRepo{userRepository}, m_EnergyLogRepo{energyLogRepository} {}

    std::optional<Dto::UserState> UserService::GetUserState(PooledConnection& conn, i32 userId)
    {
        auto user{m_UserRepo.FindById(conn, userId)};
        if (!user)
            return std::nullopt;

        const auto today{GetTodayString()};

        if (user->lastLoginDate.empty() || user->lastLoginDate != today)
            m_UserRepo.UpdateLastLoginDate(conn, userId);

        return Dto::UserToUserState(*user);
    }

    std::optional<Dto::PrivateUser> UserService::GetPrivateUser(PooledConnection& conn, i32 userId)
    {
        auto user{m_UserRepo.FindById(conn, userId)};
        if (!user)
            return std::nullopt;

        return Dto::UserToPrivateUser(*user);
    }

    void UserService::ClaimEnergy(PooledConnection& conn, i32 userId)
    {
        // Check if user can claim energy
        auto user{m_UserRepo.FindById(conn, userId)};
        if (!user)
            throw BadRequestError("User not found");

        const auto now{std::chrono::system_clock::now()};
        const auto nextRefill{user->lastEnergyRefill + std::chrono::hours(24)};
        bool canClaimDailyEnergy{now >= nextRefill};
        if (!canClaimDailyEnergy)
            throw BadRequestError("Energy can only be claimed once per 24 hours");

        // Calculate how much energy user can claim
        const auto energyClaimed{20 + (user->currentStreak * 5)};
        const auto newEnergy{std::min(user->energy + energyClaimed, 100)};

        // Update user's energy
        m_UserRepo.ClaimEnergy(conn, userId, newEnergy);

        // Add energy log
        m_EnergyLogRepo.AddEnergyLog(conn, userId, energyClaimed, "Claimed daily energy");
    }

    std::vector<Dto::EnergyLogResponse> UserService::GetEnergyLogs(PooledConnection& conn, i32 userId)
    {
        return Dto::EnergyLogsToEnergyLogResponses(m_EnergyLogRepo.GetEnergyLogs(conn, userId));
    }

    void UserService::EditProfile(PooledConnection& conn, i32 userId, const Dto::EditProfileRequest& dto)
    {
        if (!Input::IsValidUsername(dto.username))
            throw BadRequestError("Invalid username format");

        if (dto.displayName.empty())
            throw BadRequestError("Display name cannot be empty");

        if (m_UserRepo.UsernameExists(conn, userId, dto.username))
            throw ConflictError("Username already taken");

        m_UserRepo.EditProfile(conn, userId, dto.username, dto.displayName);
    }
} // namespace CLingo

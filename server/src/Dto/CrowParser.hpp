// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <crow/crow_all.h>

#include "Auth/RegisterRequest.hpp"
#include "Auth/LoginRequest.hpp"
#include "Auth/VerifyEmailRequest.hpp"
#include "Auth/ForgotPasswordRequest.hpp"
#include "Auth/ResetPasswordRequest.hpp"
#include "Auth/ResendVerificationEmailRequest.hpp"
#include "Auth/AuthResponse.hpp"

#include "User/UserState.hpp"
#include "User/PrivateUser.hpp"
#include "User/EditProfileRequest.hpp"
#include "User/LeaderboardResponse.hpp"

#include "EnergyLog/EnergyLogResponse.hpp"

#include "Level/LevelListResponse.hpp"
#include "Level/LevelDetailResponse.hpp"
#include "Level/QuizSubmitRequest.hpp"
#include "Level/QuizSubmitResponse.hpp"
#include "Level/StartLevelRequest.hpp"

namespace CLingo::Dto
{
#pragma region Auth
    inline std::optional<RegisterRequest> JsonToRegisterRequest(const crow::json::rvalue& j)
    {
        if (!j.has("username") || !j.has("email") || !j.has("password"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return RegisterRequest{
            .username = j["username"].s(),
            .email = j["email"].s(),
            .password = j["password"].s()};
    }

    inline std::optional<LoginRequest> JsonToLoginRequest(const crow::json::rvalue& j)
    {
        if (!j.has("email") || !j.has("password"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return LoginRequest{
            .email = j["email"].s(),
            .password = j["password"].s(),
        };
    }

    inline std::optional<VerifyEmailRequest> JsonToVerifyEmailRequest(const crow::json::rvalue& j)
    {
        if (!j.has("email") || !j.has("otp"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return VerifyEmailRequest{
            .email = j["email"].s(),
            .otp = j["otp"].s(),
        };
    }

    inline std::optional<ForgotPasswordRequest> JsonToForgotPasswordRequest(const crow::json::rvalue& j)
    {
        if (!j.has("email"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return ForgotPasswordRequest{
            .email = j["email"].s(),
        };
    }

    inline std::optional<ResetPasswordRequest> JsonToResetPasswordRequest(const crow::json::rvalue& j)
    {
        if (!j.has("token") || !j.has("new_password"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return ResetPasswordRequest{
            .token = j["token"].s(),
            .newPassword = j["new_password"].s(),
        };
    }

    inline std::optional<ResendVerificationEmailRequest> JsonToResendVerificationEmailRequest(const crow::json::rvalue& j)
    {
        if (!j.has("email"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return ResendVerificationEmailRequest{
            .email = j["email"].s(),
        };
    }

    inline crow::json::wvalue AuthResponseToJson(const AuthResponse& res)
    {
        crow::json::wvalue j;
        j["token"] = res.token;
        j["user"]["id"] = res.user.id;
        j["user"]["username"] = res.user.username;
        j["user"]["display_name"] = res.user.displayName;
        j["user"]["avatar_url"] = res.user.avatarUrl;

        return j;
    }

#pragma endregion

    inline crow::json::wvalue UserStateToJson(const Dto::UserState& state)
    {
        crow::json::wvalue j;
        j["user"]["aura"] = state.aura;
        j["user"]["energy"] = state.energy;
        j["user"]["current_streak"] = state.currentStreak;
        j["user"]["longest_streak"] = state.longestStreak;
        j["user"]["can_claim_daily_energy"] = state.canClaimDailyEnergy;
        j["user"]["next_energy_refill_seconds"] = state.nextEnergyRefillSeconds;

        return j;
    }

    inline crow::json::wvalue PrivateUserToJson(const Dto::PrivateUser& user)
    {
        crow::json::wvalue j;
        j["user"]["username"] = user.username;
        j["user"]["display_name"] = user.displayName;
        j["user"]["email"] = user.email;
        j["user"]["avatar_url"] = user.avatarUrl;
        j["user"]["current_streak"] = user.currentStreak;
        j["user"]["longest_streak"] = user.longestStreak;

        return j;
    }

    inline std::optional<EditProfileRequest> JsonToEditProfileRequest(const crow::json::rvalue& j)
    {
        if (!j.has("username") || !j.has("display_name"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        return EditProfileRequest{
            .username = j["username"].s(),
            .displayName = j["display_name"].s(),
        };
    };

    inline crow::json::wvalue EnergyLogResponsesToJson(const std::vector<Dto::EnergyLogResponse>& logs)
    {
        crow::json::wvalue j;
        j["energy_logs"] = crow::json::wvalue::list();

        for (uSize i{0}; i < logs.size(); ++i)
        {
            j["energy_logs"][i]["delta"] = logs[i].delta;
            j["energy_logs"][i]["reason"] = logs[i].reason;
            j["energy_logs"][i]["created_at"] = logs[i].createdAt;
        }

        return j;
    }

    inline crow::json::wvalue LevelListResponseToJson(const LevelListResponse& res)
    {
        crow::json::wvalue j;
        j["levels"] = crow::json::wvalue::list();

        for (uSize i{0}; i < res.levels.size(); ++i)
        {
            j["levels"][i]["id"] = res.levels[i].id;
            j["levels"][i]["level_number"] = res.levels[i].levelNumber;
            j["levels"][i]["title"] = res.levels[i].title;
            j["levels"][i]["energy_cost"] = res.levels[i].energyCost;
            j["levels"][i]["quiz_aura_reward"] = res.levels[i].quizAuraReward;
            j["levels"][i]["is_unlocked"] = res.levels[i].isUnlocked;
            j["levels"][i]["is_completed"] = res.levels[i].isCompleted;
            j["levels"][i]["is_started"] = res.levels[i].isStarted;
        }

        return j;
    }

    inline crow::json::wvalue SessionUserToJson(const SessionUser& user)
    {
        crow::json::wvalue j;
        j["user"]["id"] = user.id;
        j["user"]["username"] = user.username;
        j["user"]["display_name"] = user.displayName;
        j["user"]["avatar_url"] = user.avatarUrl;

        return j;
    }

    inline crow::json::wvalue LeaderboardResponseToJson(const LeaderboardResponse& res)
    {
        crow::json::wvalue j;
        j["user_rank"] = res.userRank;
        j["entries"] = crow::json::wvalue::list();

        for (uSize i{0}; i < res.entries.size(); ++i)
        {
            j["entries"][i]["rank"] = res.entries[i].rank;
            j["entries"][i]["username"] = res.entries[i].username;
            j["entries"][i]["display_name"] = res.entries[i].displayName;
            j["entries"][i]["aura"] = res.entries[i].aura;
            j["entries"][i]["avatar_url"] = res.entries[i].avatarUrl;
        }

        return j;
    }

#pragma endregion

#pragma region Quiz
    inline std::optional<QuizSubmitRequest> JsonToQuizSubmitRequest(const crow::json::rvalue& j)
    {
        if (!j.has("level_id") || !j.has("answers"))
        {
            LOG_WARN("Missing required fields");
            return std::nullopt;
        }

        std::unordered_map<i32, i32> answers;
        auto answerKeys = j["answers"].keys();
        for (const auto& key : answerKeys)
        {
            i32 questionId = std::stoi(key);
            i32 optionId = j["answers"][key].i();
            answers[questionId] = optionId;
        }

        return QuizSubmitRequest{
            .levelId = static_cast<i32>(j["level_id"].i()),
            .answers = std::move(answers)};
    }

    inline crow::json::wvalue QuizSubmitResponseToJson(const QuizSubmitResponse& res)
    {
        crow::json::wvalue j;
        j["score"] = res.score;
        j["total"] = res.total;
        j["correct"] = res.correct;
        j["passed"] = res.passed;
        j["is_completed"] = res.isCompleted;
        j["is_new_completion"] = res.isNewCompletion;

        crow::json::wvalue::list results;
        for (const auto& r : res.results)
        {
            crow::json::wvalue qj;
            qj["question_id"] = r.questionId;
            qj["question_text"] = r.questionText;
            qj["selected_option_id"] = r.selectedOptionId;
            qj["selected_option_text"] = r.selectedOptionText;
            qj["correct_option_id"] = r.correctOptionId;
            qj["correct_option_text"] = r.correctOptionText;
            qj["is_correct"] = r.isCorrect;
            qj["explanation"] = r.explanation;
            results.push_back(std::move(qj));
        }
        j["results"] = std::move(results);

        return j;
    }

    inline crow::json::wvalue LevelDetailToJson(const LevelDetail& level)
    {
        crow::json::wvalue j;
        j["id"] = level.id;
        j["level_number"] = level.levelNumber;
        j["title"] = level.title;
        j["content_md"] = level.contentMd;
        j["energy_cost"] = level.energyCost;
        j["quiz_aura_reward"] = level.quizAuraReward;
        j["is_published"] = level.isPublished;
        j["is_unlocked"] = level.isUnlocked;
        j["is_completed"] = level.isCompleted;
        j["quiz_score"] = level.quizScore;
        j["attempts"] = level.attempts;
        j["completed_at"] = level.completedAt;

        crow::json::wvalue::list questions;
        for (const auto& q : level.questions)
        {
            crow::json::wvalue qj;
            qj["id"] = q.id;
            qj["question_text"] = q.questionText;
            qj["explanation"] = q.explanation;
            qj["order_index"] = q.orderIndex;

            crow::json::wvalue::list options;
            for (const auto& opt : q.options)
            {
                crow::json::wvalue oj;
                oj["id"] = opt.id;
                oj["option_text"] = opt.optionText;
                options.push_back(std::move(oj));
            }
            qj["options"] = std::move(options);
            questions.push_back(std::move(qj));
        }
        j["questions"] = std::move(questions);

        return j;
    }

    inline crow::json::wvalue LevelDetailResponseToJson(const LevelDetailResponse& res)
    {
        crow::json::wvalue j;
        if (res.hasLevel)
            j["level"] = LevelDetailToJson(res.level);
        return j;
    }

    inline std::optional<StartLevelRequest> JsonToStartLevelRequest(const crow::json::rvalue& j)
    {
        if (!j.has("level_id"))
        {
            LOG_WARN("Missing level_id");
            return std::nullopt;
        }

        return StartLevelRequest{
            .levelId = static_cast<i32>(j["level_id"].i())};
    }

    inline crow::json::wvalue StartLevelResponseToJson(const StartLevelResponse& res)
    {
        crow::json::wvalue j;
        j["success"] = res.success;
        j["message"] = res.message;
        j["remaining_energy"] = res.remainingEnergy;
        return j;
    }
#pragma endregion
} // namespace CLingo::Dto
// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "LevelService.hpp"

#include <unordered_set>

#include <Util/Input.hpp>

namespace CLingo
{
    LevelService::LevelService(LevelRepository& levelRepository, UserRepository& userRepository, EnergyLogRepository& energyLogRepository, AuraLogRepository& auraLogRepository)
        : m_LevelRepo{levelRepository}, m_UserRepo{userRepository}, m_EnergyLogRepo{energyLogRepository}, m_AuraLogRepo{auraLogRepository} {}

    Dto::LevelListResponse LevelService::GetLevels(PooledConnection& conn, i32 userId)
    {
        // Get all published levels
        auto levels{m_LevelRepo.FindAllPublished(conn)};

        if (levels.empty())
            return Dto::LevelListResponse{{}};

        // Extract level IDs
        std::vector<i32> levelIds;
        levelIds.reserve(levels.size());
        for (const auto& level : levels)
        {
            levelIds.push_back(level.id);
        }

        // Get progress for these levels
        auto progressPairs{m_LevelRepo.FindProgressByUserId(conn, userId, levelIds)};

        // Convert to map for easy lookup (levelId -> isCompleted)
        std::unordered_map<i32, bool> completedMap;
        std::unordered_set<i32> startedSet;
        for (const auto& [levelId, isCompleted] : progressPairs)
        {
            completedMap[levelId] = isCompleted;
            startedSet.insert(levelId);
        }

        // Build response with unlock logic
        std::vector<Dto::LevelListItem> items;
        items.reserve(levels.size());

        for (uSize i{0}; i < levels.size(); ++i)
        {
            const auto& level = levels[i];

            // Unlock logic:
            // - Level 1 is always unlocked
            // - Level N is unlocked if Level N-1 is completed
            bool isUnlocked = (i == 0); // First level always unlocked

            if (i > 0)
            {
                const auto& prevLevel = levels[i - 1];
                auto it = completedMap.find(prevLevel.id);
                isUnlocked = (it != completedMap.end() && it->second);
            }

            bool isCompleted = false;
            bool isStarted = false;
            auto it = completedMap.find(level.id);
            if (it != completedMap.end())
            {
                isCompleted = it->second;
                isStarted = true;
            }

            items.push_back(Dto::LevelListItem{
                level.id,
                level.levelNumber,
                level.title,
                level.energyCost,
                level.quizAuraReward,
                isUnlocked,
                isCompleted,
                isStarted});
        }

        return Dto::LevelListResponse{std::move(items)};
    }

    Dto::LevelDetailResponse LevelService::GetLevelDetail(PooledConnection& conn, i32 userId, i32 levelId)
    {
        // Get level info
        auto levelOpt{m_LevelRepo.FindById(conn, levelId)};
        if (!levelOpt)
            return {Dto::LevelDetail{}, false};

        const auto& level = *levelOpt;

        // Get questions
        auto questions{m_LevelRepo.FindQuestionsByLevelId(conn, levelId)};

        // Get question IDs for options lookup
        std::vector<i32> questionIds;
        questionIds.reserve(questions.size());
        for (const auto& q : questions)
        {
            questionIds.push_back(q.id);
        }

        // Get options for all questions
        auto options{m_LevelRepo.FindOptionsByQuestionIds(conn, questionIds)};

        // Group options by question
        std::unordered_map<i32, std::vector<Model::QuizOption>> optionsByQuestion;
        for (auto& opt : options)
        {
            optionsByQuestion[opt.questionId].push_back(std::move(opt));
        }

        // Attach options to questions
        for (auto& q : questions)
        {
            auto it = optionsByQuestion.find(q.id);
            if (it != optionsByQuestion.end())
            {
                q.options = std::move(it->second);
            }
        }

        // Get user progress
        auto progressOpt{m_LevelRepo.FindUserProgress(conn, userId, levelId)};

        bool isUnlocked = false;
        bool isCompleted = false;
        i32 quizScore = 0;
        i32 attempts = 0;
        std::string completedAt;

        if (progressOpt)
        {
            isUnlocked = progressOpt->isUnlocked;
            isCompleted = progressOpt->isCompleted;
            quizScore = progressOpt->quizScore;
            attempts = progressOpt->attempts;
            completedAt = progressOpt->completedAt;
        }

        Dto::LevelDetail detail{
            level.id,
            level.levelNumber,
            level.title,
            level.contentMd,
            level.energyCost,
            level.quizAuraReward,
            level.isPublished,
            isUnlocked,
            isCompleted,
            quizScore,
            attempts,
            completedAt,
            std::move(questions)};

        return Dto::LevelDetailResponse{std::move(detail), true};
    }

    Dto::QuizSubmitResponse LevelService::SubmitQuiz(PooledConnection& conn, i32 userId, const Dto::QuizSubmitRequest& request)
    {
        // Get questions for this level
        auto questions{m_LevelRepo.FindQuestionsByLevelId(conn, request.levelId)};

        if (questions.empty())
        {
            return Dto::QuizSubmitResponse{
                0, 0, 0, false, false, false, {}};
        }

        // Check if user already completed this level
        auto progressOpt{m_LevelRepo.FindUserProgress(conn, userId, request.levelId)};
        bool alreadyCompleted = progressOpt && progressOpt->isCompleted;

        i32 correct = 0;
        i32 total = questions.size();
        std::vector<Dto::QuizQuestionResult> results;
        results.reserve(total);

        // Grade each answer and build results
        for (const auto& question : questions)
        {
            auto answerIt = request.answers.find(question.id);
            i32 selectedOptionId = 0;
            std::string selectedOptionText;

            if (answerIt != request.answers.end())
            {
                selectedOptionId = answerIt->second;
                // Find the selected option text
                auto options{m_LevelRepo.FindOptionsByQuestionIds(conn, {question.id})};
                for (const auto& opt : options)
                {
                    if (opt.id == selectedOptionId)
                    {
                        selectedOptionText = opt.optionText;
                        break;
                    }
                }
            }

            // Find correct option for this question
            auto correctOptOpt{m_LevelRepo.FindCorrectOption(conn, question.id)};
            i32 correctOptionId = 0;
            std::string correctOptionText;

            if (correctOptOpt)
            {
                correctOptionId = correctOptOpt->id;
                correctOptionText = correctOptOpt->optionText;
            }

            bool isCorrect = (selectedOptionId == correctOptionId && selectedOptionId != 0);
            if (isCorrect)
                correct++;

            results.push_back(Dto::QuizQuestionResult{
                question.id,
                question.questionText,
                selectedOptionId,
                selectedOptionText,
                correctOptionId,
                correctOptionText,
                isCorrect,
                question.explanation});
        }

        i32 score = total > 0 ? (correct * 100) / total : 0;
        bool passed = score >= 70;
        bool isNewCompletion = passed && !alreadyCompleted;

        // Update user progress
        m_LevelRepo.UpsertUserProgress(conn, userId, request.levelId, score, passed);

        // Give aura reward on first completion
        if (isNewCompletion)
        {
            auto levelOpt{m_LevelRepo.FindById(conn, request.levelId)};
            if (levelOpt)
            {
                i32 auraReward = levelOpt->quizAuraReward;
                m_UserRepo.AddAura(conn, userId, auraReward);
                m_AuraLogRepo.AddAuraLog(conn, userId, auraReward, "quiz_completion", request.levelId, "level");
            }
        }

        return Dto::QuizSubmitResponse{
            score, total, correct, passed, passed, isNewCompletion, std::move(results)};
    }

    Dto::StartLevelResponse LevelService::StartLevel(PooledConnection& conn, i32 userId, const Dto::StartLevelRequest& request)
    {
        // Get level info
        auto levelOpt{m_LevelRepo.FindById(conn, request.levelId)};
        if (!levelOpt)
            return {false, "Level not found", 0};

        const auto& level = *levelOpt;
        i32 energyCost = level.energyCost;

        // Check if user already has progress for this level
        auto progressOpt{m_LevelRepo.FindUserProgress(conn, userId, request.levelId)};
        if (progressOpt)
        {
            // User already started this level, no energy deduction needed
            auto userOpt{m_UserRepo.FindById(conn, userId)};
            i32 currentEnergy = userOpt ? userOpt->energy : 0;
            return {true, "Level already started", currentEnergy};
        }

        // Check if level is unlocked (level 1 always unlocked, others need previous completed)
        // For simplicity, we'll check the progress status
        // If no progress and not level 1, we need to verify the previous level is completed

        // Get user energy
        auto userOpt{m_UserRepo.FindById(conn, userId)};
        if (!userOpt)
            return {false, "User not found", 0};

        i32 currentEnergy = userOpt->energy;

        // Check if user has enough energy
        if (currentEnergy < energyCost)
            return {false, "Not enough energy", currentEnergy};

        // Deduct energy
        m_UserRepo.DeductEnergy(conn, userId, energyCost);

        // Log energy deduction
        m_EnergyLogRepo.AddEnergyLog(conn, userId, -energyCost, "level_start:" + std::to_string(request.levelId));

        // Create progress entry
        m_LevelRepo.UpsertUserProgress(conn, userId, request.levelId, 0, false);

        i32 remainingEnergy = currentEnergy - energyCost;
        return {true, "Level started", remainingEnergy};
    }
} // namespace CLingo
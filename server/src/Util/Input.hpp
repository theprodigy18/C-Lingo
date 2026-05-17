// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <algorithm>

namespace CLingo::Input
{
    constexpr uSize MIN_USERNAME_LENGTH{3};
    constexpr uSize MAX_USERNAME_LENGTH{32};

    constexpr uSize MIN_PASSWORD_LENGTH{8};
    constexpr uSize MAX_PASSWORD_LENGTH{72};

    constexpr uSize MAX_EMAIL_LENGTH{254};

    inline void TrimInPlace(std::string& str)
    {
        auto notSpace{[](unsigned char c) {
            return !std::isspace(c);
        }};

        str.erase(str.begin(), std::find_if(str.begin(), str.end(), notSpace));
        str.erase(std::find_if(str.rbegin(), str.rend(), notSpace).base(), str.end());
    }

    inline void ToLowerInPlace(std::string& str)
    {
        std::transform(str.begin(), str.end(), str.begin(), [](unsigned char c) {
            return static_cast<char>(std::tolower(c));
        });
    }

    inline std::string NormalizeEmail(std::string email)
    {
        TrimInPlace(email);
        ToLowerInPlace(email);

        return email;
    }

    inline std::string NormalizeUsername(std::string_view username)
    {
        std::string result;
        result.reserve(username.size());

        bool previousSeparator{false};

        for (unsigned char c : username)
        {
            // Trim-like behavior
            if (std::isspace(c))
            {
                if (!result.empty() && !previousSeparator)
                {
                    result += '_';
                    previousSeparator = true;
                }

                continue;
            }

            c = static_cast<unsigned char>(std::tolower(c));

            bool isAlphaNum{
                (c >= '0' && c <= '9') ||
                (c >= 'a' && c <= 'z')};

            bool isSeparator{
                c == '_' ||
                c == '-' ||
                c == '.'};

            if (isAlphaNum)
            {
                result += static_cast<char>(c);
                previousSeparator = false;
            }
            else if (isSeparator)
            {
                // Avoid duplicate separators
                if (!result.empty() && !previousSeparator)
                {
                    result += static_cast<char>(c);
                    previousSeparator = true;
                }
            }

            if (result.size() >= MAX_USERNAME_LENGTH)
                break;
        }

        // Remove trailing separators
        while (!result.empty())
        {
            char c{result.back()};

            if (c == '_' || c == '-' || c == '.')
                result.pop_back();
            else
                break;
        }

        if (result.empty())
            result = "user";

        return result;
    }

    inline bool IsValidEmail(std::string_view email)
    {
        if (email.empty())
            return false;

        if (email.size() > MAX_EMAIL_LENGTH)
            return false;

        auto atPos{email.find('@')};

        if (atPos == std::string_view::npos)
            return false;

        if (atPos == 0)
            return false;

        if (atPos == email.size() - 1)
            return false;

        return true;
    }

    inline bool IsValidUsername(std::string_view username)
    {
        if (username.size() < MIN_USERNAME_LENGTH ||
            username.size() > MAX_USERNAME_LENGTH)
        {
            return false;
        }

        bool previousSeparator{false};

        for (uSize i{0}; i < username.size(); ++i)
        {
            unsigned char c{static_cast<unsigned char>(username[i])};

            bool isAlphaNum{
                (c >= '0' && c <= '9') ||
                (c >= 'a' && c <= 'z')};

            bool isSeparator{
                c == '_' ||
                c == '-' ||
                c == '.'};

            if (!isAlphaNum && !isSeparator)
                return false;

            if (isSeparator)
            {
                if (i == 0)
                    return false;

                if (i == username.size() - 1)
                    return false;

                if (previousSeparator)
                    return false;

                previousSeparator = true;
            }
            else
            {
                previousSeparator = false;
            }
        }

        return true;
    }

    inline bool IsValidPassword(std::string_view password)
    {
        if (password.size() < MIN_PASSWORD_LENGTH ||
            password.size() > MAX_PASSWORD_LENGTH)
        {
            return false;
        }

        for (unsigned char c : password)
        {
            if (std::isspace(c))
                return false;

            if (c < 33 || c > 126)
                return false;
        }

        return true;
    }
} // namespace CLingo::Input
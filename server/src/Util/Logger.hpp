// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#ifdef DEBUG
#include <stdint.h>
#include <string_view>
#include <iostream>
#include <chrono>
#include <sstream>
#include <iomanip>

namespace CLingo
{
    enum class LogLevel : uint8_t
    {
        Trace = 0,
        Info = 1,
        Warn = 2,
        Error = 3,
        Critical = 4
    };

    namespace
    {
        inline const char* GetColor(LogLevel level)
        {
            switch (level)
            {
                case LogLevel::Trace:
                    return "\033[90m"; // dark gray
                case LogLevel::Info:
                    return "\033[32m"; // green
                case LogLevel::Warn:
                    return "\033[33m"; // yellow
                case LogLevel::Error:
                    return "\033[31m"; // red
                case LogLevel::Critical:
                    return "\033[1;31m"; // bold red
                default:
                    return "\033[0m";
            }
        }

        // -------------------------------------------------------------------------

        inline const char* GetLabel(LogLevel level)
        {
            switch (level)
            {
                case LogLevel::Trace:
                    return "TRACE";
                case LogLevel::Info:
                    return "INFO "; // trailing space for alignment
                case LogLevel::Warn:
                    return "WARN ";
                case LogLevel::Error:
                    return "ERROR";
                case LogLevel::Critical:
                    return "FATAL";
                default:
                    return "?????";
            }
        }

        // -------------------------------------------------------------------------

        inline std::string_view StripFilePath(std::string_view path)
        {
            // Find the last slash (handles both / and \ path separators)
            size_t pos = path.find_last_of("/\\");

            if (pos == std::string_view::npos)
                return path;

            return path.substr(pos + 1);
        }
    } // anonymous namespace

    inline void Log(LogLevel level, std::string_view message, std::string_view file, uint32_t line)
    {
        // Format current time as HH:MM:SS
        auto now = std::chrono::system_clock::now();
        auto time = std::chrono::system_clock::to_time_t(now);
        auto localTime = *std::localtime(&time);

        std::ostringstream timestamp;
        timestamp << std::put_time(&localTime, "%H:%M:%S");

        // [HH:MM:SS] [LEVEL] (File.cpp:Line) message
        std::cout
            << GetColor(level)
            << "[" << timestamp.str() << "]"
            << " [" << GetLabel(level) << "]"
            << " (" << StripFilePath(file) << ":" << line << ")"
            << " " << message
            << "\033[0m" // reset color after each line
            << "\n";
    }
} // namespace CLingo

#define LOG_TRACE(message) CLingo::Log(CLingo::LogLevel::Trace, message, __FILE__, __LINE__)
#define LOG_INFO(message) CLingo::Log(CLingo::LogLevel::Info, message, __FILE__, __LINE__)
#define LOG_WARN(message) CLingo::Log(CLingo::LogLevel::Warn, message, __FILE__, __LINE__)
#define LOG_ERROR(message) CLingo::Log(CLingo::LogLevel::Error, message, __FILE__, __LINE__)
#define LOG_CRITICAL(message) CLingo::Log(CLingo::LogLevel::Critical, message, __FILE__, __LINE__)

#else
#define LOG_TRACE(message)
#define LOG_INFO(message)
#define LOG_WARN(message)
#define LOG_ERROR(message)
#define LOG_CRITICAL(message)
#endif // DEBUG
// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#ifdef DEBUG
#include "Logger.hpp"

#ifdef _WIN64
#define DEBUG_BREAK() __debugbreak()
#else
#include <signal.h>
#define DEBUG_BREAK() raise(SIGTRAP)
#endif // _WIN64

#define ASSERT(condition)                                  \
    do                                                     \
    {                                                      \
        if (!(condition))                                  \
        {                                                  \
            LOG_CRITICAL("Assertion failed: " #condition); \
            DEBUG_BREAK();                                 \
        }                                                  \
    } while (0)

#define ASSERT_MSG(condition, message)                                   \
    do                                                                   \
    {                                                                    \
        if (!(condition))                                                \
        {                                                                \
            LOG_CRITICAL("Assertion failed: (" #condition ") " message); \
            DEBUG_BREAK();                                               \
        }                                                                \
    } while (0)

#else
#define ASSERT(condition)
#define ASSERT_MSG(condition, message)
#endif // DEBUG
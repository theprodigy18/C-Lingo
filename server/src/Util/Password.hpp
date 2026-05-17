// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Types.hpp>

#include <argon2.h>
#include <openssl/rand.h>

#include "Exception.hpp"

namespace CLingo::Password
{
    namespace
    {
        // Argon2id hashing parameters (tuned for moderate security vs performance)
        constexpr u32 TIME_COST = 2;
        constexpr u32 MEMORY_COST = 1 << 16; // 64 MB
        constexpr u32 PARALLELISM = 1;
        constexpr u32 HASH_LENGTH = 32;
        constexpr u32 SALT_LENGTH = 16;
    } // anonymous namespace

    inline std::string Hash(const std::string& password)
    {
        u8 salt[SALT_LENGTH];
        // Generate cryptographically secure random salt
        if (RAND_bytes(salt, SALT_LENGTH) != 1)
        {
            throw InternalError("Failed to generate random salt");
        }

        char encoded[256];

        // Perform Argon2id hashing and encode result
        i32 result{argon2id_hash_encoded(
            TIME_COST,
            MEMORY_COST,
            PARALLELISM,
            password.c_str(),
            password.size(),
            salt,
            SALT_LENGTH,
            HASH_LENGTH,
            encoded,
            sizeof(encoded))};

        if (result != ARGON2_OK)
            throw InternalError(argon2_error_message(result));

        return std::string{encoded};
    }

    inline bool Verify(const std::string& password, const std::string& hash)
    {
        i32 result{argon2id_verify(
            hash.c_str(),
            password.c_str(),
            password.size())};

        return result == ARGON2_OK;
    }
} // namespace CLingo::Password
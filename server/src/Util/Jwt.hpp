// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Types.hpp>

#include <optional>

// Use picojson as the JSON backend for jwt-cpp
#define JWT_DISABLE_PICOJSON
#include <jwt-cpp/jwt.h>
#include <jwt-cpp/traits/kazuho-picojson/defaults.h>

#include "Logger.hpp"

namespace CLingo::Jwt
{
    inline std::string Generate(u32 userId, const std::string& secret, const std::string& issuer, u32 expiryHours = 24)
    {
        auto now{std::chrono::system_clock::now()};

        return jwt::create<jwt::traits::kazuho_picojson>()
            .set_issuer(issuer)
            .set_subject(std::to_string(userId))
            .set_issued_at(now)
            .set_expires_at(now + std::chrono::hours(static_cast<i32>(expiryHours)))
            .sign(jwt::algorithm::hs256{secret});
    }

    inline std::optional<u32> Verify(const std::string& token, const std::string& secret, const std::string& issuer)
    {
        try
        {
            auto verifier{jwt::verify<jwt::traits::kazuho_picojson>()
                              .allow_algorithm(jwt::algorithm::hs256{secret})
                              .with_issuer(issuer)};

            auto decoded{jwt::decoded_jwt<jwt::traits::kazuho_picojson>(token)};
            verifier.verify(decoded);

            // Subject is expected to contain the user ID
            return std::stoi(decoded.get_subject());
        }
        catch (...)
        {
            // Any failure (parsing, signature, expiration, conversion) results in rejection
            LOG_ERROR("JWT verification failed");
            return std::nullopt;
        }
    }

} // namespace CLingo::Jwt
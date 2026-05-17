// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

namespace CLingo
{
    struct EmailConfig
    {
        std::string apiKey;
        std::string fromAddress; // e.g. "noreply@c-lingo.com"
        std::string fromName;    // e.g. "C-Lingo"
        std::string appUrl;
    };

    class EmailService
    {
    public:
        explicit EmailService(EmailConfig config);

        void SendVerificationEmail(
            const std::string& toEmail,
            const std::string& username,
            const std::string& otp);
        void SendResetPasswordEmail(
            const std::string& toEmail,
            const std::string& username,
            const std::string& token);

    private:
        // Core HTTP POST to Resend API
        void Send(
            const std::string& toEmail,
            const std::string& subject,
            const std::string& htmlBody);

        // HTML template builder
        static std::string BuildVerificationHtml(
            const std::string& username,
            const std::string& otp);

        static std::string BuildResetPasswordHtml(
            const std::string& username,
            const std::string& resetLink);

    private:
        EmailConfig m_Config;
    };
} // namespace CLingo
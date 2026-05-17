// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "EmailService.hpp"

#include <crow/crow_all.h>

#include <Util/Curl.hpp>

namespace CLingo
{
    namespace
    {
        void ReplaceAll(
            std::string& str,
            const std::string& from,
            const std::string& to)
        {
            if (from.empty())
                return;

            uSize pos{0};

            while ((pos = str.find(from, pos)) != std::string::npos)
            {
                str.replace(pos, from.length(), to);
                pos += to.length();
            }
        }

        std::string EscapeHtml(const std::string& input)
        {
            std::string out;
            out.reserve(input.size());

            for (char c : input)
            {
                switch (c)
                {
                    case '&':
                        out += "&amp;";
                        break;
                    case '<':
                        out += "&lt;";
                        break;
                    case '>':
                        out += "&gt;";
                        break;
                    case '"':
                        out += "&quot;";
                        break;
                    case '\'':
                        out += "&#39;";
                        break;
                    default:
                        out += c;
                        break;
                }
            }

            return out;
        }

        std::string VerificationTemplate()
        {
            return R"(
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0;padding:24px;background:#f5f5f5;
font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

<div style="background:#ffffff;
border-radius:12px;
padding:32px;
max-width:420px;
margin:0 auto;">

<div style="font-size:18px;
font-weight:600;
color:#1a1a1a;
margin-bottom:24px;
display:flex;
align-items:center;
gap:8px;">

<div style="width:8px;height:8px;
background:#4F46E5;
border-radius:50%;"></div>

C-Lingo

</div>

<h2 style="font-size:20px;
font-weight:600;
color:#1a1a1a;
margin:0 0 8px;">

Verify your email

</h2>

<p style="font-size:14px;
color:#6b7280;
line-height:1.6;
margin:0 0 20px;">

Hi <strong>{{USERNAME}}</strong>,
enter this code to activate your account.
Expires in 15 minutes.

</p>

<div style="text-align:center;margin:24px 0;">

{{OTP_BOXES}}

</div>

<p style="font-size:12px;
color:#9ca3af;
text-align:center;
margin:0;">

If you didn't create a C-Lingo account,
you can safely ignore this email.

</p>

</div>
</body>
</html>
)";
        }

        std::string ResetPasswordTemplate()
        {
            return R"(
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0;padding:24px;background:#f5f5f5;
font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

<div style="background:#ffffff;
border-radius:12px;
padding:32px;
max-width:420px;
margin:0 auto;">

<div style="font-size:18px;
font-weight:600;
color:#1a1a1a;
margin-bottom:24px;
display:flex;
align-items:center;
gap:8px;">

<div style="width:8px;height:8px;
background:#4F46E5;
border-radius:50%;"></div>

C-Lingo

</div>

<h2 style="font-size:20px;
font-weight:600;
color:#1a1a1a;
margin:0 0 8px;">

Reset your password

</h2>

<p style="font-size:14px;
color:#6b7280;
line-height:1.6;
margin:0 0 20px;">

Hi <strong>{{USERNAME}}</strong>,
we received a request to reset your password.
Click the button below - this link expires in 1 hour.

</p>

<a href="{{RESET_LINK}}"
style="display:block;
background:#4F46E5;
color:#ffffff;
text-decoration:none;
text-align:center;
padding:13px 24px;
border-radius:8px;
font-size:15px;
font-weight:600;
margin:24px 0;">

Reset password

</a>

<hr style="border:none;
border-top:1px solid #f3f4f6;
margin:20px 0;">

<p style="font-size:12px;
color:#9ca3af;
margin:0 0 6px;">

Or copy this link:

</p>

<div style="font-size:11px;
color:#6b7280;
word-break:break-all;
background:#f9fafb;
padding:8px 10px;
border-radius:6px;
border:1px solid #f3f4f6;">

{{RESET_LINK}}

</div>

<hr style="border:none;
border-top:1px solid #f3f4f6;
margin:20px 0;">

<p style="font-size:12px;
color:#9ca3af;
margin:0;">

If you didn't request a password reset,
you can safely ignore this email.

</p>

</div>
</body>
</html>
)";
        }
    } // anonymous namespace

    EmailService::EmailService(EmailConfig config)
        : m_Config(std::move(config)) {}

    void EmailService::SendVerificationEmail(
        const std::string& toEmail,
        const std::string& username,
        const std::string& otp)
    {
        Send(
            toEmail,
            "Verify your C-Lingo account",
            BuildVerificationHtml(username, otp));
    }

    void EmailService::SendResetPasswordEmail(
        const std::string& toEmail,
        const std::string& username,
        const std::string& token)
    {
        auto resetLink{m_Config.appUrl + "/reset-password?token=" + token};
        Send(
            toEmail,
            "Reset your C-Lingo password",
            BuildResetPasswordHtml(username, resetLink));
    }

    // Core HTTP POST to Resend API
    void EmailService::Send(
        const std::string& toEmail,
        const std::string& subject,
        const std::string& htmlBody)
    {
        // Build JSON payload safely using Crow JSON (handles escaping internally)
        crow::json::wvalue json;
        json["from"] = m_Config.fromName + " <" + m_Config.fromAddress + ">";
        json["to"][0] = toEmail;
        json["subject"] = subject;
        json["html"] = htmlBody;

        std::string payload{json.dump()};

        auto res{
            Curl::PerformRequest({.url = "https://api.resend.com/emails",
                                  .body = payload,
                                  .method = "POST",
                                  .headers = {
                                      "Content-Type: application/json",
                                      "Authorization: Bearer " + m_Config.apiKey}})};

        if (res.status != 200 || !crow::json::load(res.body).has("id"))
            throw InternalError("Resend API error: " + res.body + " (" + std::to_string(res.status) + ")");
    }

    // HTML template builder
    std::string EmailService::BuildVerificationHtml(
        const std::string& username,
        const std::string& otp)
    {
        std::string html{VerificationTemplate()};

        std::string otpBoxes;

        for (char c : otp)
        {
            otpBoxes +=
                "<div style=\"width:44px;height:52px;"
                "border:1.5px solid #4F46E5;"
                "border-radius:8px;"
                "display:inline-flex;"
                "align-items:center;"
                "justify-content:center;"
                "font-size:22px;"
                "font-weight:700;"
                "color:#4F46E5;"
                "background:#EEF2FF;"
                "margin:0 4px;\">";

            otpBoxes += EscapeHtml(std::string(1, c));

            otpBoxes += "</div>";
        }

        ReplaceAll(
            html,
            "{{USERNAME}}",
            EscapeHtml(username));

        ReplaceAll(
            html,
            "{{OTP_BOXES}}",
            otpBoxes);

        return html;
    }

    std::string EmailService::BuildResetPasswordHtml(
        const std::string& username,
        const std::string& resetLink)
    {
        std::string html{ResetPasswordTemplate()};

        ReplaceAll(
            html,
            "{{USERNAME}}",
            EscapeHtml(username));

        ReplaceAll(
            html,
            "{{RESET_LINK}}",
            EscapeHtml(resetLink));

        return html;
    }
} // namespace CLingo
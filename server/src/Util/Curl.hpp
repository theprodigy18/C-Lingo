// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <thread>

#include <curl/curl.h>

namespace CLingo::Curl
{
    struct Request
    {
        std::string url;
        std::string body; // Empty for GET
        std::string method = "GET";
        std::vector<std::string> headers;
        i32 connectTimeout = 3L;
        i32 timeout = 8L;
        i32 maxRetries = 3;
    };

    struct Response
    {
        i32 status = 0;
        std::string body;
    };

    namespace
    {
        inline uSize WriteCallback(void* contents, uSize size, uSize nmemb, std::string* output)
        {
            output->append(static_cast<char*>(contents), size * nmemb);
            return size * nmemb;
        }
    } // anonymous namespace

    inline Response PerformRequest(const Request& req)
    {
        CURL* curl{curl_easy_init()};
        if (!curl)
            throw InternalError("Failed to initialize CURL");

        for (i32 attempt{0}; attempt < req.maxRetries; ++attempt)
        {
            curl_easy_reset(curl);

            std::string response;

            struct curl_slist* headers{nullptr};
            for (const auto& h : req.headers)
                headers = curl_slist_append(headers, h.c_str());

            curl_easy_setopt(curl, CURLOPT_URL, req.url.c_str());
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
            curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, req.connectTimeout);
            curl_easy_setopt(curl, CURLOPT_TIMEOUT, req.timeout);
            // Method handling
            if (req.method == "POST")
            {
                curl_easy_setopt(curl, CURLOPT_POST, 1L);
                curl_easy_setopt(curl, CURLOPT_POSTFIELDS, req.body.c_str());
            }
            else if (req.method != "GET")
            {
                curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, req.method.c_str());
                if (!req.body.empty())
                    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, req.body.c_str());
            }

            CURLcode res{curl_easy_perform(curl)};

            i32 status{0};
            curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &status);

            curl_slist_free_all(headers);

            // === SUCCESS ===
            if (res == CURLE_OK && status >= 200 && status < 300)
            {
                curl_easy_cleanup(curl);
                return Response{status, response};
            }

            // === FAIL FAST (client error, no retry) ===
            if (res == CURLE_OK && status >= 400 && status < 500)
            {
                curl_easy_cleanup(curl);
                throw InternalError(
                    "HTTP " + req.method + " client error | status=" +
                    std::to_string(status) +
                    " | body=" + response);
            }

            // === LAST ATTEMPT ===
            if (attempt == req.maxRetries - 1)
            {
                curl_easy_cleanup(curl);
                throw std::runtime_error(
                    "HTTP " + req.method + " failed after retries | curl=" +
                    std::string(curl_easy_strerror(res)) +
                    " | status=" + std::to_string(status) +
                    " | body=" + response);
            }

            // === BACKOFF (exponential) ===
            std::this_thread::sleep_for(
                std::chrono::milliseconds(100 * (1 << attempt))); // 100, 200, 400
        }

        curl_easy_cleanup(curl);
        return Response{}; // Unreachable
    }
} // namespace CLingo::Curl
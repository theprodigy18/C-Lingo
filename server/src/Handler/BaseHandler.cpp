// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#include "BaseHandler.hpp"

namespace CLingo
{
    BaseHandler::BaseHandler(std::string basePath)
        : m_BasePath(std::move(basePath)) {}

    crow::response BaseHandler::Ok()
    {
        crow::json::wvalue res;
        res["success"] = true;

        return crow::response(crow::OK, std::move(res));
    }

    crow::response BaseHandler::Ok(crow::json::wvalue data)
    {
        crow::json::wvalue res;
        res["success"] = true;
        res["data"] = std::move(data);

        return crow::response(crow::OK, std::move(res));
    }

    crow::response BaseHandler::Error(int code, std::string message)
    {
        crow::json::wvalue res;
        res["success"] = false;
        res["message"] = std::move(message);

        return crow::response(code, std::move(res));
    }

    crow::response BaseHandler::BadRequest(std::string message)
    {
        return Error(crow::BAD_REQUEST, std::move(message));
    }

    crow::response BaseHandler::NotFound(std::string message)
    {
        return Error(crow::NOT_FOUND, std::move(message));
    }

    std::optional<crow::json::rvalue> BaseHandler::ParseJson(const crow::request& req)
    {
        auto json{crow::json::load(req.body)};
        if (!json)
            return std::nullopt;

        return json;
    }

    crow::response BaseHandler::WithConnection(
        ConnectionPool& pool,
        std::function<crow::response(PooledConnection&)> handler)
    {
        try
        {
            PooledConnection conn{pool};
            return handler(conn);
        }
        catch (const InternalError& e)
        {
            LOG_ERROR(e.what());
            return Error(crow::INTERNAL_SERVER_ERROR, "Server temporarily unavailable");
        }
        catch (const AppError& e)
        {
            LOG_ERROR(e.what());
            return Error(e.statusCode, e.what());
        }
        catch (const std::exception& e)
        {
            LOG_ERROR(e.what());
            return Error(crow::INTERNAL_SERVER_ERROR, "Server temporarily unavailable");
        }
    }

    std::optional<crow::response> BaseHandler::CheckRateLimit(
        CounterCache& cache,
        const std::string& key,
        i32 limit,
        std::chrono::seconds window)
    {
        if (cache.IsLimited(key, limit))
            return Error(crow::TOO_MANY_REQUESTS, "Too many requests, please try again later");

        cache.Increment(key, window);
        return std::nullopt;
    }

} // namespace CLingo
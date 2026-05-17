// Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
// SPDX-License-Identifier: MIT

#pragma once

#include <Common/Common.hpp>

#include <stdlib.h>
#include <fstream>

namespace CLingo
{
    class EnvLoader
    {
    public:
        explicit EnvLoader(std::string path)
        {
            Load(path);
        }

        std::string Get(const std::string& key, const std::string& defaultValue = "") const
        {
            auto it{m_EnvVariables.find(key)};
            if (it != m_EnvVariables.end())
            {
                return it->second; // Found in .env file
            }
            const char* envValue{std::getenv(key.c_str())};
            if (envValue)
            {
                return envValue; // Found in system environment
            }

            LOG_WARN("No value found for key: " + key);

            return defaultValue; // Fallback to default
        }

        std::string Require(const std::string& key) const
        {
            auto it{m_EnvVariables.find(key)};
            if (it != m_EnvVariables.end())
            {
                return it->second; // Found in .env file
            }
            const char* envValue{std::getenv(key.c_str())};
            if (envValue)
            {
                return envValue; // Found in system environment
            }

            LOG_CRITICAL("No value found for key: " + key);
            throw InternalError("Missing required environment variable: " + key);
        }

        void Set(const std::string& key, const std::string& value)
        {
            m_EnvVariables[key] = value;

#ifdef _WIN64
            _putenv_s(key.c_str(), value.c_str());
#else
            setenv(key.c_str(), value.c_str(), 1);
#endif // _WIN64
        }

    private:
        static std::string Trim(const std::string& str)
        {
            auto start{str.find_first_not_of(" \t")};
            auto end{str.find_last_not_of(" \t")};
            return (start == std::string::npos) ? "" : str.substr(start, end - start + 1);
        }

        void Load(const std::string& path)
        {
            std::ifstream file{path};
            if (!file)
            {
                LOG_CRITICAL("Failed to load env variables");
                return;
            }

            std::string line;
            while (std::getline(file, line))
            {
                line = Trim(line);
                if (line.empty() || line[0] == '#')
                    continue;

                auto delimiterPos{line.find('=')};
                if (delimiterPos == std::string::npos)
                    continue; // Skip if no '=' is found

                std::string key{Trim(line.substr(0, delimiterPos))};
                std::string value{Trim(line.substr(delimiterPos + 1))};

                if (!value.empty() && (value[0] == '"' || value[0] == '\''))
                {
                    value = value.substr(1, value.size() - 2);
                }

                m_EnvVariables[key] = value;

#ifdef _WIN64
                _putenv_s(key.c_str(), value.c_str());
#else
                setenv(key.c_str(), value.c_str(), 1);
#endif // _WIN64
            }
        }

    private:
        std::unordered_map<std::string, std::string> m_EnvVariables;
    };
} // namespace CLingo
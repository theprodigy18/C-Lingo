workspace "server"
    architecture "x86_64"
    startproject "server"

    configurations
    {
        "Debug",
        "Release"
    }

    outputdir = "%{cfg.buildcfg}-%{cfg.system}-%{cfg.architecture}"

    warnings "Extra"

    filter "toolset:gcc or toolset:clang"
        buildoptions
        {
            "-Wall",
            "-Wextra"
        }

    filter {}

project "server"
    kind "ConsoleApp"
    language "C++"
    cppdialect "C++17"

    targetdir ("bin/" .. outputdir)
    objdir ("bin-int/" .. outputdir)

    files 
    { 
        "src/**.hpp", 
        "src/**.cpp" 
    }

    includedirs 
    {
        "src",

        -- ASIO
        "Vendor/asio/include",
        "Vendor/asio/include/asio",

        -- Crow
        "Vendor/crow/include",

        -- JWT
        "Vendor/jwt-cpp/include"
    }

    defines
    {
        "ASIO_STANDALONE",
        "_CRT_SECURE_NO_WARNINGS"
    }

    links
    {
        -- PostgreSQL
        "pqxx",
        "pq",

        -- OpenSSL
        "ssl",
        "crypto",

        -- Password hashing
        "argon2",

        -- HTTP
        "curl"
    }

    filter "system:windows"
        systemversion "latest"

        defines
        {
            "_WIN32_WINNT=0x0A00"
        }

        links
        {
            "ws2_32",
            "mswsock"
        }

    filter "system:linux"
        pic "On"

        links
        {
            "pthread"
        }

    filter "configurations:Debug"
        runtime "Debug"
        symbols "On"

        defines
        {
            "DEBUG"
        }

    filter "configurations:Release"
        runtime "Release"
        optimize "Speed"

        defines
        {
            "NDEBUG"
        }

    filter {}
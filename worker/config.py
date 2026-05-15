# Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
# SPDX-License-Identifier: MIT

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)


class Config:
    # Database
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = int(os.getenv("DB_PORT", "5432"))
    DB_NAME = os.getenv("DB_NAME", "postgres")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_SSLMODE = os.getenv("DB_SSLMODE", "require")

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?sslmode={self.DB_SSLMODE}"

    # Sandbox
    SANDBOX_IMAGE = os.getenv("SANDBOX_IMAGE", "c-lingo-sandbox:latest")
    SANDBOX_TIMEOUT = int(os.getenv("SANDBOX_TIMEOUT", "30"))

    # Worker
    POLL_INTERVAL = float(os.getenv("POLL_INTERVAL", "2.0"))
    BATCH_SIZE = int(os.getenv("BATCH_SIZE", "10"))
    NUM_WORKERS = int(os.getenv("NUM_WORKERS", "4"))

    # Execution limits
    MAX_CPU_TIME = int(os.getenv("MAX_CPU_TIME", "2000"))
    MAX_WALL_TIME = int(os.getenv("MAX_WALL_TIME", "5000"))
    MAX_MEMORY = int(os.getenv("MAX_MEMORY", "262144"))
    MAX_OUTPUT_SIZE = int(os.getenv("MAX_OUTPUT_SIZE", "1048576"))

    # Paths
    SANDBOX_DIR = Path(__file__).parent.parent / "sandbox"
    TMP_DIR = SANDBOX_DIR / "tmp"


config = Config()
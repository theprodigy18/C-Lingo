# Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
# SPDX-License-Identifier: MIT

from dataclasses import dataclass
from typing import Optional
from enum import Enum


class ExecutionStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    COMPILATION_ERROR = "compilation_error"
    RUNTIME_ERROR = "runtime_error"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
    MEMORY_LIMIT_EXCEEDED = "memory_limit_exceeded"
    OUTPUT_LIMIT_EXCEEDED = "output_limit_exceeded"
    INTERNAL_ERROR = "internal_error"


@dataclass
class Submission:
    id: int
    user_id: int
    problem_id: int
    code: str
    status: str
    runtime_ms: float  # milliseconds (float, e.g., 0.5)
    memory_kb: float  # kilobytes (float, e.g., 2560.5)
    error_output: str
    submitted_at: str


@dataclass
class TestCase:
    id: int
    problem_id: int
    input_ui: str
    input: str
    expected_output: str
    explanation_md: str
    is_hidden: bool
    order_index: int


@dataclass
class Problem:
    id: int
    title: str
    slug: str
    description_md: str
    constraints_md: str
    starter_code: str
    entry_point: str
    tags: str
    difficulty: str
    energy_cost: int
    aura_reward: int
    is_published: bool
    created_at: str


@dataclass
class ExecutionResult:
    status: ExecutionStatus
    runtime_ms: float  # milliseconds (float)
    memory_kb: float  # kilobytes (float)
    output: str
    error_output: str
    exit_code: int = 0  # Raw exit code from sandbox (128+signal if killed by signal)
    compiled_output: str = ""


@dataclass
class TestCaseResult:
    test_case_id: int
    input: str
    expected_output: str
    actual_output: str
    result: ExecutionResult
    is_correct: bool
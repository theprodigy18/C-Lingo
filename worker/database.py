# Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
# SPDX-License-Identifier: MIT

import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from typing import List, Optional

from config import config
from models import Submission, TestCase, Problem


class Database:
    def __init__(self, connection_string: str):
        self.connection_string = connection_string

    @contextmanager
    def get_connection(self):
        conn = psycopg2.connect(self.connection_string)
        try:
            yield conn
        finally:
            conn.close()

    @contextmanager
    def get_cursor(self, commit: bool = False):
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            try:
                yield cursor
                if commit:
                    conn.commit()
            except Exception:
                conn.rollback()
                raise
            finally:
                cursor.close()

    def fetch_pending_submissions(self, limit: int = 10) -> List[Submission]:
        """Fetch submissions with status 'pending'."""
        with self.get_cursor() as cursor:
            cursor.execute("""
                SELECT id, user_id, problem_id, code, status, runtime_ms, memory_kb, error_output, submitted_at
                FROM submissions
                WHERE status = 'pending'
                ORDER BY submitted_at ASC
                LIMIT %s
                FOR UPDATE SKIP LOCKED
            """, (limit,))
            rows = cursor.fetchall()

        return [
            Submission(
                id=row["id"],
                user_id=row["user_id"],
                problem_id=row["problem_id"],
                code=row["code"],
                status=row["status"],
                runtime_ms=row["runtime_ms"] or 0,
                memory_kb=row["memory_kb"] or 0,
                error_output=row["error_output"] or "",
                submitted_at=row["submitted_at"].isoformat() if hasattr(row["submitted_at"], "isoformat") else str(row["submitted_at"])
            )
            for row in rows
        ]

    def fetch_problem(self, problem_id: int) -> Optional[Problem]:
        """Fetch problem details by ID."""
        with self.get_cursor() as cursor:
            cursor.execute("""
                SELECT id, title, slug, description_md, constraints_md, starter_code, entry_point,
                       tags, difficulty, energy_cost, aura_reward, is_published, created_at
                FROM problems
                WHERE id = %s
            """, (problem_id,))
            row = cursor.fetchone()

        if not row:
            return None

        return Problem(
            id=row["id"],
            title=row["title"],
            slug=row["slug"],
            description_md=row["description_md"] or "",
            constraints_md=row["constraints_md"] or "",
            starter_code=row["starter_code"] or "",
            entry_point=row["entry_point"] or "",
            tags=row["tags"] or "",
            difficulty=row["difficulty"] or "",
            energy_cost=row["energy_cost"],
            aura_reward=row["aura_reward"],
            is_published=row["is_published"],
            created_at=str(row["created_at"])
        )

    def fetch_test_cases(self, problem_id: int, include_hidden: bool = False) -> List[TestCase]:
        """Fetch test cases for a problem."""
        with self.get_cursor() as cursor:
            if include_hidden:
                cursor.execute("""
                    SELECT id, problem_id, input_ui, input, expected_output, explanation_md, is_hidden, order_index
                    FROM test_cases
                    WHERE problem_id = %s
                    ORDER BY order_index ASC
                """, (problem_id,))
            else:
                cursor.execute("""
                    SELECT id, problem_id, input_ui, input, expected_output, explanation_md, is_hidden, order_index
                    FROM test_cases
                    WHERE problem_id = %s AND is_hidden = FALSE
                    ORDER BY order_index ASC
                """, (problem_id,))
            rows = cursor.fetchall()

        return [
            TestCase(
                id=row["id"],
                problem_id=row["problem_id"],
                input_ui=row["input_ui"] or "",
                input=row["input"] or "",
                expected_output=row["expected_output"] or "",
                explanation_md=row["explanation_md"] or "",
                is_hidden=row["is_hidden"],
                order_index=row["order_index"]
            )
            for row in rows
        ]

    def update_submission(
        self,
        submission_id: int,
        status: str,
        runtime_ms: int = 0,
        memory_kb: int = 0,
        error_output: str = ""
    ):
        """Update submission status and results."""
        with self.get_cursor(commit=True) as cursor:
            cursor.execute("""
                UPDATE submissions
                SET status = %s, runtime_ms = %s, memory_kb = %s, error_output = %s
                WHERE id = %s
            """, (status, runtime_ms, memory_kb, error_output, submission_id))

    def get_submission(self, submission_id: int) -> Optional[Submission]:
        """Get a single submission by ID."""
        with self.get_cursor() as cursor:
            cursor.execute("""
                SELECT id, user_id, problem_id, code, status, runtime_ms, memory_kb, error_output, submitted_at
                FROM submissions
                WHERE id = %s
            """, (submission_id,))
            row = cursor.fetchone()

        if not row:
            return None

        return Submission(
            id=row["id"],
            user_id=row["user_id"],
            problem_id=row["problem_id"],
            code=row["code"],
            status=row["status"],
            runtime_ms=row["runtime_ms"] or 0,
            memory_kb=row["memory_kb"] or 0,
            error_output=row["error_output"] or "",
            submitted_at=row["submitted_at"].isoformat() if hasattr(row["submitted_at"], "isoformat") else str(row["submitted_at"])
        )


# Singleton instance
db = Database(config.DATABASE_URL)
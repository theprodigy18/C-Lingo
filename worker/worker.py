# Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
# SPDX-License-Identifier: MIT

import logging
import time
import signal
import sys
from typing import List

from config import config
from database import db
from models import Submission, TestCase, TestCaseResult, ExecutionStatus
from sandbox_client import sandbox


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)


class Worker:
    def __init__(self):
        self.running = True
        self.db = db
        self.sandbox = sandbox

        # Setup signal handlers
        signal.signal(signal.SIGINT, self._handle_shutdown)
        signal.signal(signal.SIGTERM, self._handle_shutdown)

    def _handle_shutdown(self, signum, frame):
        """Handle shutdown signals gracefully."""
        logger.info("Shutdown signal received, stopping worker...")
        self.running = False

    def run(self):
        """Main worker loop."""
        logger.info("Worker starting...")
        logger.info(f"Poll interval: {config.POLL_INTERVAL}s, Batch size: {config.BATCH_SIZE}")

        while self.running:
            try:
                self._process_batch()
            except Exception as e:
                logger.error(f"Error in worker loop: {e}")

            # Sleep before next poll
            time.sleep(config.POLL_INTERVAL)

        logger.info("Worker stopped")

    def _process_batch(self):
        """Fetch and process a batch of pending submissions."""
        # Fetch pending submissions
        submissions = self.db.fetch_pending_submissions(config.BATCH_SIZE)

        if not submissions:
            return

        logger.info(f"Processing {len(submissions)} submissions")

        for submission in submissions:
            self._process_submission(submission)

    def _process_submission(self, submission: Submission):
        """Process a single submission."""
        logger.info(f"Processing submission {submission.id} for problem {submission.problem_id}")

        # Update status to running
        self.db.update_submission(
            submission.id,
            ExecutionStatus.RUNNING.value,
            0, 0, ""
        )

        try:
            # Fetch problem and test cases
            problem = self.db.fetch_problem(submission.problem_id)
            if not problem:
                logger.error(f"Problem {submission.problem_id} not found for submission {submission.id}")
                self.db.update_submission(
                    submission.id,
                    ExecutionStatus.INTERNAL_ERROR.value,
                    0, 0, "Problem not found"
                )
                return

            test_cases = self.db.fetch_test_cases(submission.problem_id, include_hidden=False)
            if not test_cases:
                logger.error(f"No test cases found for problem {submission.problem_id}")
                self.db.update_submission(
                    submission.id,
                    ExecutionStatus.INTERNAL_ERROR.value,
                    0, 0, "No test cases found"
                )
                return

            # Run against all test cases
            results = self._run_test_cases(submission.code, test_cases)

            # Compare outputs with expected
            test_results = self._compare_outputs(results, test_cases)

            # Determine overall result
            overall_result = self._evaluate_results(results, test_results)

            # Log results
            for i, tr in enumerate(test_results):
                status_str = "PASSED" if tr.is_correct else f"FAILED ({tr.result.status.value})"
                logger.info(f"  Test {i+1}: {status_str}")

            # Update submission with final result
            max_runtime = max((tr.result.runtime_ms for tr in test_results), default=0)
            max_memory = max((tr.result.memory_kb for tr in test_results), default=0)
            error_msg = self._build_error_message(test_results, overall_result)

            self.db.update_submission(
                submission.id,
                overall_result.value,
                max_runtime,
                max_memory,
                error_msg
            )

            logger.info(f"Submission {submission.id} completed: {overall_result.value}")

        except Exception as e:
            logger.error(f"Error processing submission {submission.id}: {e}")
            self.db.update_submission(
                submission.id,
                ExecutionStatus.INTERNAL_ERROR.value,
                0, 0, f"Processing error: {str(e)}"
            )

    def _run_test_cases(self, code: str, test_cases: List[TestCase]) -> List[TestCaseResult]:
        """Run code against all test cases and compare with expected output."""
        results = []

        for test_case in test_cases:
            result = self.sandbox.execute(code, test_case.input)
            is_correct = (
                result.status == ExecutionStatus.ACCEPTED and
                result.output.strip() == test_case.expected_output.strip()
            )
            test_result = TestCaseResult(
                test_case_id=test_case.id,
                input=test_case.input,
                expected_output=test_case.expected_output,
                actual_output=result.output,
                result=result,
                is_correct=is_correct
            )
            results.append(test_result)

        return results

    def _evaluate_results(self, results: List[TestCaseResult], overall_status: ExecutionStatus) -> ExecutionStatus:
        """Evaluate test case results to determine overall status."""
        # If any test case has compilation error, return compilation error
        if any(tr.result.status == ExecutionStatus.COMPILATION_ERROR for tr in results):
            return ExecutionStatus.COMPILATION_ERROR

        # If any test case has internal error, return internal error
        if any(tr.result.status == ExecutionStatus.INTERNAL_ERROR for tr in results):
            return ExecutionStatus.INTERNAL_ERROR

        # Check all test cases passed
        all_passed = True
        for tr in results:
            if not tr.is_correct:
                all_passed = False

        if all_passed:
            return ExecutionStatus.ACCEPTED
        else:
            return ExecutionStatus.WRONG_ANSWER

    def _build_error_message(self, test_results: List[TestCaseResult], overall_status: ExecutionStatus) -> str:
        """Build error message from test results."""
        if overall_status == ExecutionStatus.ACCEPTED:
            return ""

        if overall_status == ExecutionStatus.COMPILATION_ERROR:
            # Find the first compilation error
            for tr in test_results:
                if tr.result.status == ExecutionStatus.COMPILATION_ERROR:
                    return tr.result.error_output
            return "Compilation failed"

        if overall_status == ExecutionStatus.WRONG_ANSWER:
            # Find first failed test case
            for i, tr in enumerate(test_results, 1):
                if not tr.is_correct:
                    return f"Wrong answer on test case {i}. Expected: {repr(tr.expected_output)}, Got: {repr(tr.actual_output)}"
            return "Wrong answer"

        return overall_status.value


def main():
    """Entry point for the worker."""
    worker = Worker()
    worker.run()


if __name__ == "__main__":
    main()
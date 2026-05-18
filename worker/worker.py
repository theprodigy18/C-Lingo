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

            test_cases = self.db.fetch_test_cases(submission.problem_id, include_hidden=True)
            if not test_cases:
                logger.error(f"No test cases found for problem {submission.problem_id}")
                self.db.update_submission(
                    submission.id,
                    ExecutionStatus.INTERNAL_ERROR.value,
                    0, 0, "No test cases found"
                )
                return

            # Combine user code with entry point
            full_code = submission.code.strip() + "\n\n" + problem.entry_point

            # Run against all test cases
            test_results = self._run_test_cases(full_code, test_cases)

            # Determine overall result
            overall_result = self._evaluate_results(test_results)

            # Log results
            for i, tr in enumerate(test_results):
                status_str = "PASSED" if tr.is_correct else f"FAILED ({tr.result.status.value})"
                logger.info(f"  Test {i+1}: {status_str}")

            # Update submission with final result
            max_runtime = max((tr.result.runtime_ms for tr in test_results), default=0)
            max_memory = max((tr.result.memory_kb for tr in test_results), default=0)
            # Get exit code from first test result for signal info
            exit_code = test_results[0].result.exit_code if test_results else 0
            error_msg = self._build_error_message(test_results, overall_result, exit_code)

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

    def _evaluate_results(self, test_results: List[TestCaseResult]) -> ExecutionStatus:
        """Evaluate test case results to determine overall status."""
        # If any test case has compilation error, return compilation error
        if any(tr.result.status == ExecutionStatus.COMPILATION_ERROR for tr in test_results):
            return ExecutionStatus.COMPILATION_ERROR

        # If any test case has runtime error, return runtime error
        if any(tr.result.status == ExecutionStatus.RUNTIME_ERROR for tr in test_results):
            return ExecutionStatus.RUNTIME_ERROR

        # If any test case has time limit exceeded
        if any(tr.result.status == ExecutionStatus.TIME_LIMIT_EXCEEDED for tr in test_results):
            return ExecutionStatus.TIME_LIMIT_EXCEEDED

        # Check all test cases passed
        all_passed = True
        for tr in test_results:
            if not tr.is_correct:
                all_passed = False

        if all_passed:
            return ExecutionStatus.ACCEPTED
        else:
            return ExecutionStatus.WRONG_ANSWER

    def _build_error_message(self, test_results: List[TestCaseResult], overall_status: ExecutionStatus, raw_exit_code: int = 0) -> str:
        """Build clean error message from test results."""
        if overall_status == ExecutionStatus.ACCEPTED:
            return ""

        if overall_status == ExecutionStatus.COMPILATION_ERROR:
            for tr in test_results:
                if tr.result.status == ExecutionStatus.COMPILATION_ERROR:
                    return tr.result.error_output
            return "Compilation failed"

        if overall_status == ExecutionStatus.RUNTIME_ERROR:
            # Clean up raw runner output - extract signal name
            if raw_exit_code > 128:
                signal_num = raw_exit_code - 128
                signal_names = {
                    1: "Hangup",
                    2: "Interrupt (Ctrl+C)",
                    3: r"Quit (Ctrl+\)",
                    4: "Illegal instruction",
                    5: "Trace/breakpoint",
                    6: "Aborted",
                    7: "Bus error",
                    8: "Floating point exception",
                    9: "Killed",
                    10: "User defined signal 1",
                    11: "Segmentation fault",
                    12: "User defined signal 2",
                    13: "Pipe broken",
                    14: "Alarm",
                    15: "Terminated",
                    16: "Stack fault",
                    17: "Child stopped",
                    18: "Continued",
                    19: "Stopped (signal)",
                    20: "Stopped",
                    21: "TSTP",
                    22: "STOP",
                    23: "RTOSTOP",
                    24: "Window resize",
                    25: "URG",
                    26: "VTALRM",
                    27: "PROF",
                    28: "WINCH",
                    29: "IO",
                    30: "PWR",
                    31: "SYS",
                }
                signal_name = signal_names.get(signal_num, f"Signal {signal_num}")
                return f"Runtime error: {signal_name} (signal {signal_num})"

            for tr in test_results:
                if tr.result.status == ExecutionStatus.RUNTIME_ERROR:
                    return tr.result.error_output
            return "Runtime error"

        if overall_status == ExecutionStatus.WRONG_ANSWER:
            for i, tr in enumerate(test_results, 1):
                if not tr.is_correct:
                    # Clean formatting
                    expected = tr.expected_output.strip()
                    actual = tr.actual_output.strip()
                    return f"Test {i} failed:\nExpected: {expected}\nGot: {actual}"
            return "Wrong answer"

        if overall_status == ExecutionStatus.TIME_LIMIT_EXCEEDED:
            return "Time limit exceeded"

        if overall_status == ExecutionStatus.MEMORY_LIMIT_EXCEEDED:
            return "Memory limit exceeded"

        if overall_status == ExecutionStatus.OUTPUT_LIMIT_EXCEEDED:
            return "Output limit exceeded"

        return overall_status.value


def main():
    """Entry point for the worker."""
    worker = Worker()
    worker.run()


if __name__ == "__main__":
    main()
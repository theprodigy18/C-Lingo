# Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
# SPDX-License-Identifier: MIT

import subprocess
import tempfile
import shutil
import os
from pathlib import Path
from typing import Tuple, Optional

from config import config
from models import ExecutionResult, ExecutionStatus


class SandboxClient:
    def __init__(
        self,
        image: str = None,
        timeout: int = None,
        max_memory_kb: int = None,
        max_output_size: int = None
    ):
        self.image = image or config.SANDBOX_IMAGE
        self.timeout = timeout or config.SANDBOX_TIMEOUT
        self.max_memory_kb = max_memory_kb or config.MAX_MEMORY
        self.max_output_size = max_output_size or config.MAX_OUTPUT_SIZE

    def execute(
        self,
        code: str,
        input_data: str
    ) -> ExecutionResult:
        """
        Execute C code in the sandbox container.

        Args:
            code: The C source code to execute
            input_data: The input to provide to the program

        Returns:
            ExecutionResult with status, runtime, memory, output and error info
        """
        # Create a temporary directory for the files
        with tempfile.TemporaryDirectory(prefix="clingo_sandbox_") as tmpdir:
            tmpdir = Path(tmpdir)

            # Write code file
            code_path = tmpdir / "code.c"
            code_path.write_text(code)

            # Write input file
            input_path = tmpdir / "input.txt"
            input_path.write_text(input_data)

            # Output file (created by sandbox)
            output_path = tmpdir / "output.txt"

            try:
                result = self._run_container(
                    tmpdir,
                    code_path,
                    input_path,
                    output_path
                )
                return result
            except subprocess.TimeoutExpired:
                return ExecutionResult(
                    status=ExecutionStatus.TIME_LIMIT_EXCEEDED,
                    runtime_ms=config.MAX_WALL_TIME,
                    memory_kb=0,
                    output="",
                    error_output="Execution timed out",
                    compiled_output=""
                )
            except Exception as e:
                return ExecutionResult(
                    status=ExecutionStatus.INTERNAL_ERROR,
                    runtime_ms=0,
                    memory_kb=0,
                    output="",
                    error_output=f"Internal error: {str(e)}",
                    compiled_output=""
                )

    def _run_container(
        self,
        tmpdir: Path,
        code_path: Path,
        input_path: Path,
        output_path: Path
    ) -> ExecutionResult:
        """Run the Docker container with the code."""
        cmd = [
            "docker", "run", "--rm",
            "--network=none",
            f"--memory={self.max_memory_kb}kb",
            "--pids-limit=100",
            "-v", f"{tmpdir}:/code",
            "-w", "/code",
            self.image,
            "/usr/local/bin/runner.sh",
            "code.c",
            "input.txt",
            "output.txt"
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
        except subprocess.TimeoutExpired:
            # Kill the container if still running
            raise

        # Parse the output
        return self._parse_result(result, output_path)

    def _parse_result(
        self,
        result: subprocess.CompletedProcess,
        output_path: Path
    ) -> ExecutionResult:
        """Parse the sandbox execution result."""
        stdout = result.stdout
        stderr = result.stderr
        exit_code = result.returncode

        # Check for compilation error
        if "COMPILE ERROR" in stdout:
            # Extract compile error message
            compile_output = self._extract_between(stdout, "=== COMPILING ===", "=== SANDBOX END ===")
            return ExecutionResult(
                status=ExecutionStatus.COMPILATION_ERROR,
                runtime_ms=0,
                memory_kb=0,
                output="",
                error_output=compile_output.strip(),
                compiled_output=compile_output.strip()
            )

        # Check for timeout
        if exit_code == 124 or "TIMEOUT" in stdout:
            return ExecutionResult(
                status=ExecutionStatus.TIME_LIMIT_EXCEEDED,
                runtime_ms=config.MAX_WALL_TIME,
                memory_kb=0,
                output="",
                error_output="Execution time limit exceeded",
                compiled_output=""
            )

        # Check for runtime error
        if "RUNTIME ERROR" in stdout:
            runtime_output = self._extract_between(stdout, "=== RUNNING ===", "=== SANDBOX END ===")
            return ExecutionResult(
                status=ExecutionStatus.RUNTIME_ERROR,
                runtime_ms=0,
                memory_kb=0,
                output="",
                error_output=runtime_output.strip(),
                compiled_output=""
            )

        # Check for output limit exceeded
        if "OUTPUT LIMIT EXCEEDED" in stdout:
            return ExecutionResult(
                status=ExecutionStatus.OUTPUT_LIMIT_EXCEEDED,
                runtime_ms=0,
                memory_kb=0,
                output="",
                error_output="Output size exceeded limit",
                compiled_output=""
            )

        # Check for non-zero exit code without specific error
        if exit_code != 0 and exit_code != 137:
            return ExecutionResult(
                status=ExecutionStatus.RUNTIME_ERROR,
                runtime_ms=0,
                memory_kb=0,
                output="",
                error_output=f"Process exited with code {exit_code}",
                compiled_output=""
            )

        # Success - extract runtime and memory from output
        runtime_ms = 0
        memory_kb = 0

        for line in stdout.split("\n"):
            if "Runtime:" in line:
                try:
                    runtime_ms = int(line.split(":")[1].strip().replace("ms", ""))
                except (ValueError, IndexError):
                    pass
            if "Memory:" in line:
                try:
                    memory_kb = int(line.split(":")[1].strip().replace("KB", ""))
                except (ValueError, IndexError):
                    pass

        # Read output file
        output = ""
        if output_path.exists():
            output = output_path.read_text(errors="replace")

        # Truncate output if too large
        if len(output.encode()) > self.max_output_size:
            output = output[:self.max_output_size]

        return ExecutionResult(
            status=ExecutionStatus.ACCEPTED,
            runtime_ms=runtime_ms,
            memory_kb=memory_kb,
            output=output,
            error_output=stderr if stderr else "",
            compiled_output=""
        )

    def _extract_between(self, text: str, start: str, end: str) -> str:
        """Extract text between two markers."""
        try:
            start_idx = text.index(start) + len(start)
            end_idx = text.index(end)
            return text[start_idx:end_idx]
        except ValueError:
            return text


# Singleton instance
sandbox = SandboxClient()
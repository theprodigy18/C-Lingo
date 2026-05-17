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
        full_code: str,
        input_data: str
    ) -> ExecutionResult:
        """
        Execute C code in the sandbox container.

        Args:
            full_code: The complete C source code (starter_code + entry_point combined)
            input_data: The input to provide to the program

        Returns:
            ExecutionResult with status, runtime, memory, output and error info
        """
        # Use the shared sandbox tmp directory instead of random temp
        tmpdir = config.TMP_DIR
        tmpdir.mkdir(parents=True, exist_ok=True)

        # Use unique filenames to avoid collisions
        import uuid
        run_id = uuid.uuid4().hex[:8]
        code_path = tmpdir / f"code_{run_id}.c"
        input_path = tmpdir / f"input_{run_id}.txt"
        output_path = tmpdir / f"output_{run_id}.txt"

        try:
            # Write code file
            code_path.write_text(full_code)

            # Write input file - convert \\n to actual newlines
            actual_input = input_data.replace('\\n', '\n')
            input_path.write_text(actual_input)

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
                memory_kb=0.0,
                output="",
                error_output="Execution timed out",
                compiled_output=""
            )
        except Exception as e:
            return ExecutionResult(
                status=ExecutionStatus.INTERNAL_ERROR,
                runtime_ms=0.0,
                memory_kb=0.0,
                output="",
                error_output=f"Internal error: {str(e)}",
                compiled_output=""
            )
        finally:
            # Cleanup temp files
            for p in (code_path, input_path, output_path):
                try:
                    p.unlink()
                except FileNotFoundError:
                    pass
            # Also cleanup run_mem artifacts
            for suffix in ('_run.txt', '_output_run.txt'):
                p = tmpdir / f"{run_id}{suffix}"
                try:
                    p.unlink()
                except FileNotFoundError:
                    pass

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
            code_path.name,
            input_path.name,
            output_path.name
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

        # Check for compilation error (could be in stdout or stderr)
        if "COMPILE ERROR" in stdout or ("error:" in stderr.lower()):
            compile_output = self._extract_between(stdout, "=== COMPILING ===", "=== SANDBOX END ===")
            if not compile_output.strip():
                # Try to extract just the gcc error from stderr
                for line in stderr.split("\n"):
                    if "error:" in line.lower():
                        compile_output = line.strip()
                        break
            return ExecutionResult(
                status=ExecutionStatus.COMPILATION_ERROR,
                runtime_ms=0.0,
                memory_kb=0.0,
                output="",
                error_output=compile_output.strip() if compile_output.strip() else "Compilation failed",
                exit_code=exit_code,
                compiled_output=compile_output.strip()
            )

        # Check for timeout
        if exit_code == 124 or "TIMEOUT" in stdout:
            return ExecutionResult(
                status=ExecutionStatus.TIME_LIMIT_EXCEEDED,
                runtime_ms=config.MAX_WALL_TIME,
                memory_kb=0.0,
                output="",
                error_output="Execution time limit exceeded",
                exit_code=exit_code,
                compiled_output=""
            )

        # Check for runtime error
        if "RUNTIME ERROR" in stdout:
            runtime_output = self._extract_between(stdout, "=== RUNNING ===", "=== SANDBOX END ===")
            # Remove debug lines and empty lines
            lines = [l for l in runtime_output.split("\n") if l.strip() and not l.startswith("MEMORY_KB:") and not l.startswith("---")]
            runtime_output = "\n".join(lines)
            return ExecutionResult(
                status=ExecutionStatus.RUNTIME_ERROR,
                runtime_ms=0.0,
                memory_kb=0.0,
                output="",
                error_output=runtime_output.strip(),
                exit_code=exit_code,
                compiled_output=""
            )

        # Check for output limit exceeded
        if "OUTPUT LIMIT EXCEEDED" in stdout:
            return ExecutionResult(
                status=ExecutionStatus.OUTPUT_LIMIT_EXCEEDED,
                runtime_ms=0.0,
                memory_kb=0.0,
                output="",
                error_output="Output size exceeded limit",
                exit_code=exit_code,
                compiled_output=""
            )

        # Check for non-zero exit code without specific error
        if exit_code != 0 and exit_code != 137:
            return ExecutionResult(
                status=ExecutionStatus.RUNTIME_ERROR,
                runtime_ms=0.0,
                memory_kb=0.0,
                output="",
                error_output=f"Process exited with code {exit_code}",
                exit_code=exit_code,
                compiled_output=""
            )

        # Success - extract runtime and memory from output
        runtime_ms = 0.0
        memory_kb = 0.0

        for line in stdout.split("\n"):
            if "Runtime:" in line:
                try:
                    runtime_ms = float(line.split(":")[1].strip().replace("ms", ""))
                except (ValueError, IndexError):
                    pass
            if "Memory:" in line:
                try:
                    memory_kb = float(line.split(":")[1].strip().replace("KB", ""))
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
            exit_code=exit_code,
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
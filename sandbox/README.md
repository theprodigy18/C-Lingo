# C-Lingo Sandbox

Sandbox environment untuk compile dan execute C code secara aman.

## Setup

### Build Docker Image

```bash
cd sandbox
docker build -t c-lingo-sandbox .
```

### Build dengan docker-compose

```bash
docker-compose build
```

## Usage

### CLI Testing

```bash
# Create test files
echo '#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}' > /tmp/test.c

echo "World" > /tmp/input.txt

# Run container
docker run --rm \
  -v /tmp/test.c:/code/code.c \
  -v /tmp/input.txt:/code/input.txt \
  -v /tmp/output.txt:/code/output.txt \
  c-lingo-sandbox

# Check output
cat /tmp/output.txt
```

### Python Integration Contoh

```python
import subprocess
import tempfile
import os

def run_code(code: str, input_data: str, timeout: int = 5) -> dict:
    """Run C code in sandbox and return result."""

    with tempfile.TemporaryDirectory() as tmpdir:
        # Write files
        code_path = os.path.join(tmpdir, "code.c")
        input_path = os.path.join(tmpdir, "input.txt")
        output_path = os.path.join(tmpdir, "output.txt")

        with open(code_path, "w") as f:
            f.write(code)
        with open(input_path, "w") as f:
            f.write(input_data)

        # Run container
        result = subprocess.run([
            "docker", "run", "--rm",
            "-v", f"{code_path}:/code/code.c",
            "-v", f"{input_path}:/code/input.txt",
            "-v", f"{output_path}:/code/output.txt",
            "--network=none",
            "--memory=512m",
            "--pids-limit=100",
            "c-lingo-sandbox"
        ], capture_output=True, text=True, timeout=timeout + 10)

        # Parse output
        output = {
            "stdout": open(output_path).read() if os.path.exists(output_path) else "",
            "stderr": result.stderr,
            "exit_code": result.returncode,
            "success": result.returncode == 0
        }

        return output
```

## Resource Limits

| Resource | Limit |
|----------|-------|
| CPU Time | 2 seconds per test case |
| Wall Time | 5 seconds (incl. compile) |
| Memory | 256 MB |
| Output Size | 1 MB |
| Processes | 50 |
| Network | None (isolated) |

## Files

- `Dockerfile` - Alpine-based sandbox image
- `runner.sh` - Execution script
- `docker-compose.yml` - Container orchestration

## Notes

- Container berjalan sebagai user non-root (sandbox:1000)
- Tidak ada network access
- Output dibatasi 1MB
- Process di-kill jika timeout

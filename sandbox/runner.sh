#!/bin/sh
# Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
# SPDX-License-Identifier: MIT

# Sandbox runner script for C code execution
# Usage: runner.sh <source_file> <input_file> <output_file>

SOURCE_FILE="${1:-code.c}"
INPUT_FILE="${2:-input.txt}"
OUTPUT_FILE="${3:-output.txt}"

# Resource limits
MAX_WALL_TIME=5
MAX_OUTPUT_SIZE=1048576
COMPILE_TIMEOUT=10
NUM_RUNS=3  # Best of N runs

echo "=== SANDBOX START ==="

if [ ! -f "$SOURCE_FILE" ] || [ ! -f "$INPUT_FILE" ]; then
    echo "ERROR: Required files not found"
    exit 1
fi

# Compile
echo "=== COMPILING ==="
COMPILE_START=$(date +%s%N)

COMPILE_OUTPUT=$(timeout -s KILL $COMPILE_TIMEOUT gcc -O2 -Wall -o /tmp/solution "$SOURCE_FILE" 2>&1)
COMPILE_EXIT=$?
COMPILE_TIME_NS=$((($(date +%s%N) - $COMPILE_START)))

if [ $COMPILE_EXIT -ne 0 ]; then
    echo "=== COMPILE ERROR ==="
    echo "$COMPILE_OUTPUT"
    echo "=== SANDBOX END ==="
    exit 1
fi

COMPILE_TIME_MS=$(echo "scale=3; $COMPILE_TIME_NS / 1000000" | bc)
echo "Compile time: ${COMPILE_TIME_MS}ms"
echo "=== RUNNING ==="

# Apply memory limit
ulimit -v 262144
ulimit -u 50

# Create wrapper to track memory using getrusage
cat > /tmp/run_mem.c << 'EOF'
#include <stdio.h>
#include <stdlib.h>
#include <sys/resource.h>
#include <unistd.h>
#include <sys/wait.h>

int main(int argc, char *argv[]) {
    if (argc < 3) return 1;
    const char *input = argv[1];
    const char *output = argv[2];

    FILE *out = fopen(output, "w");
    if (!out) return 1;

    FILE *in = fopen(input, "r");
    if (!in) { fclose(out); return 1; }

    pid_t pid = fork();
    if (pid == 0) {
        dup2(fileno(in), STDIN_FILENO);
        dup2(fileno(out), STDOUT_FILENO);
        fclose(in);
        fclose(out);
        char *args[] = {"/tmp/solution", NULL};
        execv("/tmp/solution", args);
        _exit(1);
    }

    fclose(in);

    struct rusage ru;
    long max_rss = 0;
    int status;

    // Track memory while process runs
    while (1) {
        int ret = waitpid(pid, &status, WNOHANG);
        if (ret != 0) break;

        if (access("/proc/self/task", F_OK) == 0) {
            char path[64];
            snprintf(path, sizeof(path), "/proc/%d/status", pid);
            FILE *f = fopen(path, "r");
            if (f) {
                char line[256];
                while (fgets(line, sizeof(line), f)) {
                    if (line[0] == 'V' && line[1] == 'm') {
                        long val = 0;
                        sscanf(line + 5, "%ld", &val);
                        if (val > max_rss) max_rss = val;
                        break;
                    }
                }
                fclose(f);
            }
        }
        // Busy wait for faster sampling
        for (volatile int i = 0; i < 1000; i++);
    }

    fclose(out);

    getrusage(RUSAGE_CHILDREN, &ru);

    long runtime_us = ru.ru_utime.tv_sec * 1000000L + ru.ru_utime.tv_usec;
    long mem_kb = (ru.ru_maxrss > 0) ? ru.ru_maxrss : max_rss;
    if (mem_kb == 0) mem_kb = 512;

    FILE *res = fopen("/tmp/run_result.txt", "w");
    if (res) {
        fprintf(res, "RUNTIME:%ld\nMEMORY:%ld\n", runtime_us, mem_kb);
        fclose(res);
    }

    // Return exit code - if killed by signal, use 128 + signal number
    if (WIFSIGNALED(status)) {
        return 128 + WTERMSIG(status);
    }
    return WEXITSTATUS(status);
}
EOF

gcc -o /tmp/run_mem /tmp/run_mem.c 2>/dev/null

# Run multiple times and collect results
BEST_RUNTIME=999999999
BEST_MEMORY=0
FINAL_EXIT=0

for run in $(seq 1 $NUM_RUNS); do
    rm -f /tmp/run_result.txt /tmp/output_run.txt

    timeout -s KILL $MAX_WALL_TIME /tmp/run_mem "$INPUT_FILE" /tmp/output_run.txt > /dev/null 2>&1
    EXIT_CODE=$?

    if [ $EXIT_CODE -eq 137 ]; then
        echo "=== TIMEOUT ==="
        echo "=== SANDBOX END ==="
        exit 124
    fi

    if [ $EXIT_CODE -ne 0 ]; then
        echo "=== RUNTIME ERROR ==="
        echo "=== SANDBOX END ==="
        exit $EXIT_CODE
    fi

    # Read results
    if [ -f "/tmp/run_result.txt" ]; then
        RUNTIME=$(grep "RUNTIME:" /tmp/run_result.txt | cut -d: -f2)
        MEM=$(grep "MEMORY:" /tmp/run_result.txt | cut -d: -f2)

        # Track best (minimum) runtime
        if [ -n "$RUNTIME" ] && [ "$RUNTIME" -lt "$BEST_RUNTIME" ]; then
            BEST_RUNTIME=$RUNTIME
            cp /tmp/output_run.txt "$OUTPUT_FILE"
        fi

        # Track max memory across all runs
        if [ -n "$MEM" ] && [ "$MEM" -gt "$BEST_MEMORY" ]; then
            BEST_MEMORY=$MEM
        fi
    fi

    FINAL_EXIT=$EXIT_CODE
done

# Ensure we have valid values
BEST_RUNTIME=${BEST_RUNTIME:-0}
BEST_MEMORY=${BEST_MEMORY:-512}

# Check output size
OUTPUT_SIZE=$(wc -c < "$OUTPUT_FILE" 2>/dev/null || echo 0)
if [ "$OUTPUT_SIZE" -gt "$MAX_OUTPUT_SIZE" ]; then
    echo "=== OUTPUT LIMIT EXCEEDED ==="
    echo "=== SANDBOX END ==="
    exit 1
fi

# Convert runtime to ms with 3 decimal places
RUNTIME_MS=$(echo "scale=3; $BEST_RUNTIME / 1000" | bc)

echo "Runtime: ${RUNTIME_MS}ms"
echo "Memory: ${BEST_MEMORY}KB"
echo "=== ACCEPTED ==="
echo "=== SANDBOX END ==="

exit $FINAL_EXIT
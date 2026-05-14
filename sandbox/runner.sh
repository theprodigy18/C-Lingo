#!/bin/sh
# Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
# SPDX-License-Identifier: MIT

# Sandbox runner script for C code execution
# Usage: runner.sh <source_file> <input_file> <output_file>

set -e

SOURCE_FILE="${1:-code.c}"
INPUT_FILE="${2:-input.txt}"
OUTPUT_FILE="${3:-output.txt}"

# Resource limits
MAX_CPU_TIME=2          # 2 seconds
MAX_WALL_TIME=5          # 5 seconds (includes compile time)
MAX_MEMORY=262144        # 256 MB in KB
MAX_OUTPUT_SIZE=1048576  # 1 MB in bytes
MAX_PROCESSES=50

# Compile timeout
COMPILE_TIMEOUT=10

echo "=== SANDBOX START ==="
echo "Source: $SOURCE_FILE"
echo "Input: $INPUT_FILE"
echo "Output: $OUTPUT_FILE"

# Check files exist
if [ ! -f "$SOURCE_FILE" ]; then
    echo "ERROR: Source file not found"
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "ERROR: Input file not found"
    exit 1
fi

# Compile
echo "=== COMPILING ==="
COMPILE_START=$(date +%s%3N)

COMPILE_OUTPUT=$(gcc -O2 -Wall -o /tmp/solution "$SOURCE_FILE" 2>&1)
COMPILE_EXIT=$?

COMPILE_END=$(date +%s%3N)
COMPILE_TIME=$((COMPILE_END - COMPILE_START))

if [ $COMPILE_EXIT -ne 0 ]; then
    echo "=== COMPILE ERROR ==="
    echo "$COMPILE_OUTPUT"
    echo "=== SANDBOX END ==="
    exit 1
fi

echo "Compile time: ${COMPILE_TIME}ms"
echo "=== RUNNING ==="

# Run with resource limits using ulimit and timeout
# Note: These limits apply to the user running the process
ulimit -v $MAX_MEMORY
ulimit -u $MAX_PROCESSES

# Run with timeout
# Redirect output and capture exit code
OUTPUT=$(timeout --signal=KILL $MAX_WALL_TIME \
    /usr/bin/time -f "%e %M" \
    /tmp/solution < "$INPUT_FILE" 2>&1) || {
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 137 ]; then
        echo "=== TIMEOUT ==="
        echo "Process killed due to timeout"
        echo "=== SANDBOX END ==="
        exit 124  # timeout exit code
    fi
    echo "=== RUNTIME ERROR ==="
    echo "$OUTPUT"
    echo "=== SANDBOX END ==="
    exit $EXIT_CODE
}

# Extract memory and time from time output
RUNTIME_MS=$(echo "$OUTPUT" | tail -1 | awk '{print $1 * 1000}')
MEMORY_KB=$(echo "$OUTPUT" | tail -1 | awk '{print $2}')

# Get the actual output (everything except last line which is time info)
ACTUAL_OUTPUT=$(echo "$OUTPUT" | sed '$d')

# Check output size
OUTPUT_SIZE=$(echo "$ACTUAL_OUTPUT" | wc -c)
if [ $OUTPUT_SIZE -gt $MAX_OUTPUT_SIZE ]; then
    echo "=== OUTPUT LIMIT EXCEEDED ==="
    echo "Output size: $OUTPUT_SIZE bytes (max: $MAX_OUTPUT_SIZE)"
    echo "=== SANDBOX END ==="
    exit 1
fi

# Write output
echo "$ACTUAL_OUTPUT" > "$OUTPUT_FILE"

echo "Runtime: ${RUNTIME_MS}ms"
echo "Memory: ${MEMORY_KB}KB"
echo "=== ACCEPTED ==="
echo "=== SANDBOX END ==="

exit 0

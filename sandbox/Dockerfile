# Copyright (c) 2026 Febri Andika, Galih Mahda, and Ivan Alfariziq
# SPDX-License-Identifier: MIT

# Lightweight Alpine-based C sandbox
FROM alpine:3.19

# Install C compiler and utilities
RUN apk add --no-cache \
    gcc \
    musl-dev \
    linux-headers \
    libc-dev \
    make

# Create non-root user for security
RUN addgroup -g 1000 sandbox && \
    adduser -u 1000 -G sandbox -s /bin/sh -D sandbox

# Create working directories
WORKDIR /code
RUN mkdir -p /code/input /code/output /code/tmp && \
    chmod 755 /code

# Copy runner script
COPY runner.sh /usr/local/bin/runner.sh
RUN chmod +x /usr/local/bin/runner.sh

# Switch to non-root user
USER sandbox

# Default command
CMD ["runner.sh"]

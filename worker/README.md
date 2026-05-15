# C-Lingo Worker

Background worker untuk memproses submission coding practice.

## Prerequisites

1. **Docker** - Untuk menjalankan sandbox container
2. **Python 3.9+** - Untuk menjalankan worker
3. **PostgreSQL** - Database connection

## Setup

### 1. Build Sandbox Docker Image

```bash
cd ../sandbox
docker build -t c-lingo-sandbox .
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Edit `worker/.env` sesuai dengan environment Anda:

```env
# Database
DB_HOST=your_host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSLMODE=require

# Sandbox
SANDBOX_IMAGE=c-lingo-sandbox:latest
SANDBOX_TIMEOUT=30

# Worker
POLL_INTERVAL=2.0
BATCH_SIZE=10
```

## Usage

### Run Worker

```bash
python worker.py
```

Worker akan:
1. Poll database setiap `POLL_INTERVAL` detik
2. Ambil submissions dengan status `pending`
3. Run code di sandbox untuk setiap test case
4. Update status submission berdasarkan hasil

### Run with Debug Logging

```bash
python -c "import logging; logging.basicConfig(level=logging.DEBUG)" worker.py
```

### Stop Worker

Tekan `Ctrl+C` atau kirim signal `SIGTERM` untuk graceful shutdown.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Worker                               │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────────┐    │
│  │ Worker  │───>│ Database    │    │ SandboxClient    │    │
│  │ Loop    │    │ (psycopg2)  │    │ (Docker)         │    │
│  └─────────┘    └─────────────┘    └──────────────────┘    │
│       │               │                      │               │
│       │               │                      │               │
│       v               v                      v               │
│  ┌─────────┐    ┌─────────┐          ┌───────────┐        │
│  │ Poll    │    │ Fetch   │          │ Execute   │        │
│  │ Pending │    │ Submis  │          │ Code      │        │
│  └─────────┘    └─────────┘          └───────────┘        │
└─────────────────────────────────────────────────────────────┘
        │               │                      │
        v               v                      v
    ┌────────────────────────────────────────────┐
    │              PostgreSQL                     │
    │  submissions table (status: pending/running) │
    └────────────────────────────────────────────┘
                           │
                           v
    ┌────────────────────────────────────────────┐
    │           Docker Sandbox Container          │
    │  Compile & Run C code with resource limits   │
    └────────────────────────────────────────────┘
```

## Flow

1. **Fetch**: Worker ambil submissions dengan `status = 'pending'` dari database
2. **Lock**: Row di-lock dengan `FOR UPDATE SKIP LOCKED` untuk mencegah double-processing
3. **Update**: Status di-set ke `running`
4. **Execute**: Code di-run terhadap setiap test case di sandbox
5. **Compare**: Output dibandingkan dengan expected output
6. **Result**: Status di-set ke `accepted`, `wrong_answer`, `compilation_error`, dll
7. **Repeat**: Worker tidur `POLL_INTERVAL` detik, lalu ulangi

## Status Codes

| Status | Description |
|--------|-------------|
| `pending` | Menunggu diproses |
| `running` | Sedang diproses |
| `accepted` | Semua test case passed |
| `wrong_answer` | Output tidak cocok |
| `compilation_error` | Gagal compile |
| `runtime_error` | Runtime error (segfault, dll) |
| `time_limit_exceeded` | Timeout |
| `memory_limit_exceeded` | Memory limit exceeded |
| `output_limit_exceeded` | Output terlalu besar |
| `internal_error` | Error internal worker |

## Monitoring

Worker menampilkan log untuk setiap submission:

```
2026-05-15 10:30:00 [INFO] Processing 3 submissions
2026-05-15 10:30:00 [INFO] Processing submission 42 for problem 1
2026-05-15 10:30:02 [INFO]   Test 1: PASSED
2026-05-15 10:30:02 [INFO]   Test 2: PASSED
2026-05-15 10:30:03 [INFO]   Test 3: FAILED (wrong_answer)
2026-05-15 10:30:03 [INFO] Submission 42 completed: wrong_answer
```
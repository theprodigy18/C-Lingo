# API Routes

## Auth (`/auth`)

| Method | Endpoint                              | Description                        | Rate Limit                        |
|--------|---------------------------------------|------------------------------------|-----------------------------------|
| POST   | `/auth/register`                      | Register a new user                | 5 req / 1 hour (per IP)           |
| POST   | `/auth/login`                         | Login with email & password        | 10 req / 15 min (per IP), 5 req / 15 min (per email) |
| POST   | `/auth/verify-email`                  | Verify email with OTP              | 5 req / 15 min (per IP & email)   |
| POST   | `/auth/forgot-password`               | Request password reset             | 3 req / 1 min (per IP & email)    |
| POST   | `/auth/reset-password`                | Reset password with OTP            | 5 req / 15 min (per IP)           |
| POST   | `/auth/resend-verification-email`     | Resend email verification OTP      | 5 req / 15 min (per IP)           |
| GET    | `/auth/:provider`                     | Redirect to OAuth provider         | —                                 |
| GET    | `/auth/:provider/callback`            | OAuth callback from provider       | —                                 |

> Supported OAuth providers: `google`, `github`

---

## User (`/user`) 🔒

> All routes require authentication.

| Method | Endpoint                  | Description                       |
|--------|---------------------------|-----------------------------------|
| GET    | `/user/me`                | Get current user profile          |
| GET    | `/user/me/state`          | Get current user state            |
| PUT    | `/user/me`                | Edit user information             |
| POST   | `/user/me/energy/claim`   | Claim daily energy for user       |
| GET    | `/user/me/energy/logs`    | Get energy logs of user          |
| GET    | `/user/me/leaderboard`    | Get leaderboard with user rank   |

---

## Levels (`/levels`) 🔒

> All routes require authentication.

| Method | Endpoint                  | Description                       |
|--------|---------------------------|-----------------------------------|
| GET    | `/levels`                 | Get all published levels         |
| POST   | `/levels/detail`          | Get level detail with quiz       |
| POST   | `/levels/start`           | Start a level (deduct energy)   |
| POST   | `/levels/quiz/submit`     | Submit quiz answers               |

### Start Level

Request body:
```json
{
  "level_id": 1
}
```

Response:
```json
{
  "success": true,
  "message": "Level started",
  "remaining_energy": 90
}
```

### Submit Quiz

Request body:
```json
{
  "level_id": 1,
  "answers": {
    "1": 3,
    "2": 1,
    "3": 4
  }
}
```

Response:
```json
{
  "score": 100,
  "total": 3,
  "correct": 3,
  "passed": true,
  "explanation": "You answered 3 out of 3 questions correctly.",
  "is_completed": true
}
```
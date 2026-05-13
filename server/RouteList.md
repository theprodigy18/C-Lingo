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

## User (`/users`) 🔒

> All routes require authentication.

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | `/users/me`       | Get current user profile |
| GET    | `/users/me/state` | Get current user state   |
| PUT    | `/users/me`       | Edit user information    |
| POST    | `/users/me/energy/claims` | Claim daily energy for user  |
| GET    | `/users/me/energy/logs`       | Get energy logs of user    |


import type { AuthData } from "../types/auth";

export function saveAuthSession(auth: AuthData) {
  localStorage.setItem("token", auth.token);
  localStorage.setItem("user", JSON.stringify(auth.user));
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { hideLoadingModal, showLoadingModal, toast } from "../lib/alert";
import { saveAuthSession } from "../lib/auth";
import { clearAuth } from "../lib/token";
import type { User } from "../types/auth";

interface OAuthJwtPayload {
  exp?: number;
  sub?: string | number;
  id?: string | number;
  user_id?: string | number;
  username?: string;
  display_name?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  picture?: string;
}

function getCallbackToken() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const queryParams = new URLSearchParams(window.location.search);
  return hashParams.get("token") ?? queryParams.get("token");
}

function toNumber(value: string | number | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function buildUserFromToken(token: string): User {
  const payload = jwtDecode<OAuthJwtPayload>(token);
  const fallbackName =
    payload.display_name ?? payload.name ?? payload.username ?? "User";

  return {
    id: toNumber(payload.id ?? payload.user_id ?? payload.sub),
    username: payload.username ?? String(payload.sub ?? "oauth-user"),
    display_name: fallbackName,
    email: payload.email ?? "",
    avatar_url: payload.avatar_url ?? payload.picture ?? "",
  };
}

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    showLoadingModal({
      title: "Completing sign in",
      text: "Please wait while we finish your OAuth login...",
    });

    const token = getCallbackToken();

    if (!token) {
      hideLoadingModal();
      clearAuth();
      toast.error("OAuth login failed. Token was not found.");
      navigate("/sign-in", { replace: true });
      return;
    }

    try {
      const user = buildUserFromToken(token);
      saveAuthSession({ token, user });
      hideLoadingModal();
      navigate("/dashboard", { replace: true });
    } catch {
      hideLoadingModal();
      clearAuth();
      toast.error("OAuth login failed. Invalid token received.");
      navigate("/sign-in", { replace: true });
    }
  }, [navigate]);

  return null;
}

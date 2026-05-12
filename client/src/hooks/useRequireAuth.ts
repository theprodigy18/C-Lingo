import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, isTokenValid } from "../lib/token";

export function useRequireAuth() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token && isTokenValid(token));

  useEffect(() => {
    if (isAuthenticated) return;

    clearAuth();
    navigate("/sign-in", { replace: true });
  }, [isAuthenticated, navigate]);

  return { checking: !isAuthenticated };
}

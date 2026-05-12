import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, isTokenValid } from "../lib/token";

export function useRedirectIfAuthenticated() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token && isTokenValid(token));

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
      return;
    }

    clearAuth();
  }, [isAuthenticated, navigate]);

  return { checking: isAuthenticated };
}

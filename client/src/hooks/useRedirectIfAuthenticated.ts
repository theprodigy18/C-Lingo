import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenValid, clearAuth } from "../lib/token";

export function useRedirectIfAuthenticated() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && isTokenValid(token)) {
      navigate("/dashboard", { replace: true });
    } else {
      clearAuth();
      setChecking(false);
    }
  }, [navigate]);

  return { checking };
}

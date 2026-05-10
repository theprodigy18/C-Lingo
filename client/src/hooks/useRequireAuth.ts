import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenValid, clearAuth } from "../lib/token";

export function useRequireAuth() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !isTokenValid(token)) {
      clearAuth();
      navigate("/sign-in", { replace: true });
    } else {
      setChecking(false);
    }
  }, [navigate]);

  return { checking };
}

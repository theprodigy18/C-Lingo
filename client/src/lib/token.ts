import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number;
  sub?: string | number;
}

export function isTokenValid(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    const tokenNotExpired = exp * 1000 > Date.now();
    const userDataExists = localStorage.getItem("user") !== null;
    return tokenNotExpired && userDataExists;
  } catch {
    return false;
  }
}

export function getTokenPayload(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

import { jwtDecode } from 'jwt-decode';
import type { SessionUser } from '../types/auth';

const TOKEN_KEY = 'token';
const SESSION_USER_KEY = 'sessionuser';

type JwtPayload = {
  exp?: number;
};

export type AuthSessionStatus =
  | {
      isValid: true;
      token: string;
      sessionuser: SessionUser;
    }
  | {
      isValid: false;
      token: null;
      sessionuser: null;
    };

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
};

export const saveAuthSession = (token: string, sessionuser: SessionUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(sessionuser));
};

const getSessionUser = (): SessionUser | null => {
  const sessionuser = localStorage.getItem(SESSION_USER_KEY);

  if (!sessionuser) {
    return null;
  }

  try {
    const parsedSessionUser = JSON.parse(sessionuser) as Partial<SessionUser>;

    if (
      (typeof parsedSessionUser.id !== 'number' &&
        typeof parsedSessionUser.id !== 'string') ||
      typeof parsedSessionUser.username !== 'string' ||
      parsedSessionUser.username.length === 0
    ) {
      return null;
    }

    return parsedSessionUser as SessionUser;
  } catch {
    return null;
  }
};

const isTokenUnexpired = (token: string) => {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);

    if (!exp) {
      return false;
    }

    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getAuthSessionStatus = (): AuthSessionStatus => {
  const token = localStorage.getItem(TOKEN_KEY);
  const sessionuser = getSessionUser();

  if (!token || !sessionuser || !isTokenUnexpired(token)) {
    clearAuthSession();

    return {
      isValid: false,
      token: null,
      sessionuser: null,
    };
  }

  return {
    isValid: true,
    token,
    sessionuser,
  };
};

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const ADMIN_TOKEN_KEY = "crumb_admin_token";

//decodes a JWT payload
function parseJwt(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

//Checks if a JWT is still valid
export function isTokenValid(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 > Date.now();
}

//Custom hook to manage admin authentication state and actions.
export function useAdminAuth() {
  const [token, setToken] = useState(() =>
    localStorage.getItem(ADMIN_TOKEN_KEY),
  );
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    return isTokenValid(savedToken) ? parseJwt(savedToken) : null;
  });
  const navigate = useNavigate();

  const isAuthenticated = Boolean(token && isTokenValid(token));

  // Sync state if token in localStorage changes or expires
  useEffect(() => {
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (currentToken && isTokenValid(currentToken)) {
        setToken(currentToken);
        setUser(parseJwt(currentToken));
      } else {
        setToken(null);
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = useCallback((newToken) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(parseJwt(newToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setUser(null);
    navigate("/admin", { replace: true });
  }, [navigate]);

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  };
}

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sos_token");
    const savedUser = localStorage.getItem("sos_user");
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem("sos_token");
        localStorage.removeItem("sos_user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const token = await authAPI.login(username, password);
    if (!token || typeof token !== "string") throw new Error("Invalid token received");

    const payload = parseJwt(token);
    const userData = {
      token,
      name: username,
      role: null, // role is set separately from registration
      sub: payload?.sub || username,
    };

    localStorage.setItem("sos_token", token);
    localStorage.setItem("sos_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  // Call this after login to set role (from registration data stored locally)
  const setUserRole = useCallback((role) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, role };
      localStorage.setItem("sos_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const register = useCallback(async (data) => {
    const result = await authAPI.register(data);
    // Store role mapping locally (since backend JWT doesn't embed role)
    const roleMap = JSON.parse(localStorage.getItem("sos_role_map") || "{}");
    roleMap[data.name] = data.role;
    localStorage.setItem("sos_role_map", JSON.stringify(roleMap));
    return result;
  }, []);

  const getRoleForUser = useCallback((username) => {
    const roleMap = JSON.parse(localStorage.getItem("sos_role_map") || "{}");
    return roleMap[username] || null;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sos_token");
    localStorage.removeItem("sos_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, setUserRole, getRoleForUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

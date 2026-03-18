import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session
  useEffect(() => {
    const token = localStorage.getItem("sos_token");
    const savedUser = localStorage.getItem("sos_user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("sos_token");
        localStorage.removeItem("sos_user");
      }
    }
    setLoading(false);
  }, []);

  // Login: backend returns raw JWT string
  const login = useCallback(async (username, password) => {
    const token = await authAPI.login(username, password);
    if (!token || typeof token !== "string") throw new Error("Invalid token received");

    // Retrieve role from local role-map (saved at registration time)
    const roleMap = JSON.parse(localStorage.getItem("sos_role_map") || "{}");
    const role = roleMap[username.trim()] || null;

    const userData = { token, name: username.trim(), role };
    localStorage.setItem("sos_token", token);
    localStorage.setItem("sos_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  // After login, allow manual role set (for RoleSelector fallback)
  const setUserRole = useCallback((role) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, role };
      localStorage.setItem("sos_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Register: saves role locally so login can retrieve it
  const register = useCallback(async (data) => {
    const result = await authAPI.register(data);
    // Save name → role mapping for login to pick up
    const roleMap = JSON.parse(localStorage.getItem("sos_role_map") || "{}");
    roleMap[data.name.trim()] = data.role;
    localStorage.setItem("sos_role_map", JSON.stringify(roleMap));
    return result;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sos_token");
    localStorage.removeItem("sos_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

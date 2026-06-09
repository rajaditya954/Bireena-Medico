import { createContext, useState, useEffect } from "react";

import { authService } from "../services/authService";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {

  // ======================================================
  // STATES
  // ======================================================

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // REFRESH SESSION
  // ======================================================

  const refresh = async () => {

    try {

      const data = await authService.getMe();

      setUser(data.user);

    } catch (error) {

      setUser(null);

    } finally {

      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    refresh();
  }, []);

  // ======================================================
  // LOGIN
  // ======================================================

  const login = async (credentials) => {

    try {

      const data = await authService.login(credentials);

      setUser(data.user);

      return data.user;

    } catch (error) {

      console.error("Login Failed:", error);

      throw error;
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const logout = async () => {

    try {

      await authService.logout();

    } catch (error) {

      console.error("Logout failed", error);

    } finally {

      setUser(null);
    }
  };

  // ======================================================
  // CONTEXT PROVIDER
  // ======================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
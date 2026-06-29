import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextObject";
import { AuthUseCase } from "../../application/usecases/AuthUseCase";

/**
 * AuthProvider — wraps the app and supplies auth state via React Context.
 *
 * Context value: { user, loading, login, register, logout }
 *   login(email, password)         → calls estate_core.api.login
 *   register(name, email, password) → calls estate_core.api.register_and_login
 */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore persisted session on app boot
  useEffect(() => {
    const sessionUser = AuthUseCase.getCurrentSession();
    if (sessionUser) setUser(sessionUser);
    setLoading(false);
  }, []);

  /** Dedicated login — calls estate_core.api.login */
  const login = async (email, password) => {
    const authenticated = await AuthUseCase.login(email, password);
    setUser(authenticated);
    return authenticated;
  };

  /** Registration — calls estate_core.api.register_and_login */
  const register = async (name, email, password) => {
    const authenticated = await AuthUseCase.loginOrRegister(name, email, password);
    setUser(authenticated);
    return authenticated;
  };

  const logout = () => {
    AuthUseCase.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

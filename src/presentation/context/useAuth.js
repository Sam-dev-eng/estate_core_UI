import { useContext } from "react";
import { AuthContext } from "./AuthContextObject";

/**
 * Hook to consume the authentication context.
 * Must be used inside <AuthProvider>.
 *
 * Returns: { user, loading, login, logout }
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}

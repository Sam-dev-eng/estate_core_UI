import { createContext } from "react";

/**
 * The raw React context object.
 * Import this only in AuthContext.jsx (Provider) and useAuth.js (consumer hook).
 * All other files should use the useAuth() hook.
 */
export const AuthContext = createContext(null);

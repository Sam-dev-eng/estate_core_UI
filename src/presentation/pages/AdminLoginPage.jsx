import React, { useState, useEffect } from "react";
import { AuthUseCase } from "../../application/usecases/AuthUseCase";
import { useAuth } from "../context/useAuth";

const ADMIN_SESSION_KEY = "estate_core_admin_session";

// Utility to check if admin session is valid
export function isAdminAuthenticated() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "granted";
}

// Utility to clear admin session
export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export default function AdminLoginPage({ navigateTo }) {
  const { logout } = useAuth();
  const [username, setUsername]  = useState("");
  const [password, setPassword]  = useState("");
  const [error, setError]        = useState("");
  const [loading, setLoading]    = useState(false);
  const [showPass, setShowPass]  = useState(false);

  useEffect(() => {
    // Clear regular user session
    logout();
    // Clear admin session
    clearAdminSession();
  }, [logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Calls the dedicated admin endpoint — no customer session is touched
      await AuthUseCase.adminLogin(username, password);
      sessionStorage.setItem(ADMIN_SESSION_KEY, "granted");
      window.history.replaceState(null, "", "/admin");
      navigateTo("admin-dashboard");
    } catch (err) {
      setError(err?.message || "Incorrect administrator credentials. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[#080b13]">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-rose-500/6 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/8 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 animate-scale-in">

        {/* Shield Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-indigo-600/20 border border-rose-500/20 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/10">
            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Access</h1>
          <p className="text-slate-400 text-sm mt-1 text-center">
            This area is restricted. Enter the administrator username and password to continue.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Administrator Username
            </label>
            <div className="relative">
              <input
                id="admin-username"
                type="text"
                required
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full px-4 py-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/60 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Administrator Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPass ? "text" : "password"}
                required
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 pr-12 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/60 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPass ? (
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 font-bold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-rose-500/10 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Verifying...
              </span>
            ) : "Access Admin Panel"}
          </button>

          <button
            type="button"
            onClick={() => navigateTo("landing")}
            className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}

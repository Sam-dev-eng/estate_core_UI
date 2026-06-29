import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { isAdminAuthenticated } from "../pages/AdminLoginPage";

export default function Navbar({ currentPage, navigateTo }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu when page changes
  useEffect(() => {
    setMobileOpen(false);
  }, [currentPage]);

  const navLinkClass = (page) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
      currentPage === page
        ? "text-teal-400 font-semibold"
        : "text-slate-300 hover:text-white"
    }`;

  const handleNav = (page) => {
    navigateTo(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of Estate Core?")) {
      logout();
      handleNav("landing");
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled
          ? "bg-[#060912]/95 border-slate-800/80 shadow-xl shadow-black/40"
          : "bg-[#080b13]/85 border-slate-800/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={() => handleNav("landing")}
            className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-extrabold text-xl leading-none">E</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Estate <span className="text-teal-400">Core</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <button onClick={() => handleNav("landing")} className={navLinkClass("landing")}>
              Browse Properties
            </button>
            <button
              onClick={() => navigateTo(isAdminAuthenticated() ? "admin-dashboard" : "admin-login")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                currentPage === "admin-dashboard" || currentPage === "admin-login"
                  ? "text-rose-400 font-semibold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Admin
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-800 ml-2">
              {user ? (
                <>
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs text-slate-400 leading-tight">Welcome,</span>
                    <span className="text-sm font-semibold text-slate-200 leading-tight">
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/10 border border-rose-500/30 rounded-lg transition-all duration-300"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNav("login")}
                    className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-300"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNav("signup")}
                    className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 rounded-lg shadow-lg shadow-teal-500/10 hover:scale-[1.02] transition-all duration-300"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle mobile menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={`block h-0.5 bg-current rounded transition-all duration-300 origin-left ${
                  mobileOpen ? "rotate-45 translate-y-px" : ""
                }`}
              />
              <span
                className={`block h-0.5 bg-current rounded transition-all duration-300 ${
                  mobileOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 bg-current rounded transition-all duration-300 origin-left ${
                  mobileOpen ? "-rotate-45 -translate-y-px" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0b0f19] animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            <button
              onClick={() => handleNav("landing")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === "landing"
                  ? "bg-teal-500/10 text-teal-400"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              Browse Properties
            </button>
            <button
              onClick={() => {
                navigateTo(isAdminAuthenticated() ? "admin-dashboard" : "admin-login");
                setMobileOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === "admin-dashboard" || currentPage === "admin-login"
                  ? "bg-rose-500/10 text-rose-400"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              }`}
            >
              Admin
            </button>
            <div className="pt-3 border-t border-slate-800 mt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Logged in as</p>
                    <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-xs font-semibold text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/10 transition-all"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleNav("login")}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-center text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNav("signup")}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-teal-500 to-indigo-600 rounded-lg transition-all"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

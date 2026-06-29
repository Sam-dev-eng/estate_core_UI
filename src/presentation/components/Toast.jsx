import React, { useEffect } from "react";

/**
 * Toast notification component
 * Props:
 *   message  - string to display
 *   type     - "success" | "error" | "info"
 *   onClose  - callback to clear the toast
 *   duration - auto-dismiss ms (default 4000)
 */
export default function Toast({ message, type = "info", onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    success: "bg-teal-500/15 border-teal-500/30 text-teal-300",
    error:   "bg-rose-500/15 border-rose-500/30 text-rose-300",
    info:    "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
  };

  const icons = {
    success: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01" />
      </svg>
    ),
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div
        className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl border shadow-2xl shadow-black/30 ${styles[type]} backdrop-blur-xl max-w-sm`}
      >
        {icons[type]}
        <p className="text-sm font-medium leading-snug flex-1">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

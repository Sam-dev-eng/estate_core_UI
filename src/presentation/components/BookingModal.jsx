import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { BookInspectionUseCase } from "../../application/usecases/BookInspectionUseCase";

export default function BookingModal({ property, onClose, onSuccess, onError }) {
  const { user } = useAuth();
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [date, setDate]       = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  // Pre-fill from authenticated user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Trap Esc key to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!date) { setLocalError("Please pick a preferred date."); return; }

    setLoading(true);
    try {
      const [year, month, day] = date.split("-");
      const formattedDate = `${day}|${month}|${year}`;

      await BookInspectionUseCase.execute({
        propertyId:   property.id,
        customerName: name,
        email,
        phone,
        preferredDate: formattedDate,
        token: user?.token || "",
      });

      onSuccess("Inspection booked! Our team will contact you shortly.");
      onClose();
    } catch (err) {
      const msg = err?.message || "Failed to submit booking. Please try again.";
      setLocalError(msg);
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 shadow-2xl relative modal-content">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close booking modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-2xl font-bold text-white mb-1">Book Inspection</h3>
        <p className="text-xs text-slate-400 mb-6">
          Scheduling tour for{" "}
          <span className="text-teal-400 font-semibold">{property.title}</span>
          {" "}—{" "}{property.location}
        </p>

        {localError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {localError}
          </div>
        )}

        {/* Gate: must be logged in */}
        {!user ? (
          <div className="py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1">Authentication Required</p>
            <p className="text-slate-500 text-xs mb-6">
              Please sign in or create an account to book a tour inspection.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text" required
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel" required
                value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 09087654387"
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Preferred Inspection Date
              </label>
              <input
                type="date" required
                value={date} onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
              <button
                type="button" onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-teal-500/10 active:scale-[0.97] disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Scheduling...
                  </span>
                ) : "Schedule Tour"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

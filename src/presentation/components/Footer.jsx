import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#060912] border-t border-slate-800/60 text-slate-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Brand Info */}
          <div className="max-w-sm text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center">
                <span className="text-white font-extrabold text-sm">E</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Estate <span className="text-teal-400">Core</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Redefining luxury living. Estate Core leverages industry-leading architecture and modern systems to present curated luxury properties to verified buyers worldwide.
            </p>
          </div>

          {/* Contact & Copyright */}
          <div className="text-center md:text-right text-sm text-slate-500 space-y-1">
            <p>info@estatecore.domain</p>
            <p>+1 (800) 555-CORE</p>
            <p className="text-xs text-slate-600 pt-2">© {new Date().getFullYear()} Estate Core. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import PropertyCard from "../components/PropertyCard";
import BookingModal from "../components/BookingModal";
import Toast from "../components/Toast";
import { useAuth } from "../context/useAuth";
import { GetPropertiesUseCase } from "../../application/usecases/GetPropertiesUseCase";

export default function LandingPage({ navigateTo, routeParams }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  // Filters
  const [searchTerm, setSearchTerm]       = useState("");
  const [selectedType, setSelectedType]   = useState("All");
  const [priceRange, setPriceRange]       = useState(10000000);

  // Modal
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Toast
  const [toast, setToast] = useState({ message: "", type: "info" });
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);
  const clearToast = useCallback(() => setToast({ message: "", type: "info" }), []);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await GetPropertiesUseCase.execute();
      setProperties(data);
    } catch (err) {
      setError("Unable to load properties. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  // Handle post-login auto-open booking modal redirect
  useEffect(() => {
    if (routeParams?.autoOpenBooking && routeParams?.openBookingFor) {
      setSelectedProperty(routeParams.openBookingFor);
    }
  }, [routeParams]);

  const handleBookClick = (property) => {
    if (!user) {
      window.redirectTarget       = "book-tour";
      window.redirectTargetParams = { property };
      window.redirectFromPage     = "landing";
      navigateTo("login");
    } else {
      setSelectedProperty(property);
    }
  };

  // Filtered list
  const filtered = properties.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
    const matchType   = selectedType === "All" || p.propertyType === selectedType;
    const matchPrice  = p.price <= priceRange;
    return matchSearch && matchType && matchPrice;
  });

  const uniqueTypes = ["All", ...new Set(properties.map((p) => p.propertyType))];

  return (
    <div className="bg-[#080b13] min-h-screen text-slate-100">
      {/* ── Hero ── */}
      <section className="relative py-28 md:py-36 overflow-hidden border-b border-slate-900">
        {/* Background blobs */}
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-teal-500/8 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-indigo-500/8 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-teal-400 bg-teal-400/10 border border-teal-400/20 mb-6 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse inline-block" />
              Premium Real Estate Platform
            </span>

            <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight leading-[1.06] mb-6 animate-slide-up">
              Find Your <br />
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                Dream Space
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in">
              Estate Core is the premier digital gateway for curated luxury residential listings.
              We connect modern buyers with spectacular villas, penthouses, and residences — all
              powered by clean, resilient architecture.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <a
                href="#catalog"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 shadow-xl shadow-teal-500/15 hover:shadow-teal-500/25 transition-all duration-300"
              >
                Explore Catalog
              </a>
              <button
                onClick={() => navigateTo("signup")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all duration-300 cursor-pointer"
              >
                Create Free Account
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-900/80 rounded-2xl overflow-hidden border border-slate-800/70">
            {[
              { label: "Active Listings",   value: loading ? "..." : properties.length.toString() },
              { label: "Cities Covered",     value: "24+" },
              { label: "Verified Agents",    value: "150+" },
              { label: "Tours Booked",       value: "2,400+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0b0e17] px-6 py-5 text-center">
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 border-b border-slate-900/80 bg-[#060912]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-white">Why <span className="text-teal-400">Estate Core?</span></h2>
            <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto">
              Built on Clean Architecture principles, every feature is designed for reliability, speed, and transparency.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                ),
                title: "Verified Listings",
                desc: "Every property undergoes a thorough verification process to ensure accuracy and legitimacy before it appears in the catalog.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                ),
                title: "Instant Tour Booking",
                desc: "Schedule a personal inspection visit in under 60 seconds directly from the property listing page.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                ),
                title: "Secure & Private",
                desc: "JWT-authenticated sessions, encrypted data transit, and role-based admin access ensure your data is always protected.",
              },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-800 hover:border-teal-500/30 transition-all duration-300 group">
                <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-5 group-hover:bg-teal-500/15 transition-all">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catalog ── */}
      <section id="catalog" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Curated <span className="text-teal-400">Properties</span>
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                {filtered.length} listing{filtered.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <button
              onClick={loadProperties}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-teal-400 border border-slate-800 hover:border-teal-500/30 rounded-lg transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#0b0e17] border border-slate-800/70 mb-10">
            {/* Search */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Search
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500 text-sm transition-all"
              >
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Max Price
                </label>
                <span className="text-[10px] font-bold text-teal-400">${priceRange.toLocaleString()}</span>
              </div>
              <input
                type="range" min="100" max="10000000" step="50000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full mt-1.5 cursor-pointer"
              />
            </div>
          </div>

          {/* Grid / States */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl bg-[#0b0e17] border border-slate-800/60 overflow-hidden">
                  <div className="h-36 sm:h-56 shimmer" />
                  <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                    <div className="h-3 sm:h-4 shimmer rounded w-3/4" />
                    <div className="h-2.5 sm:h-3 shimmer rounded w-1/2" />
                    <div className="h-2.5 sm:h-3 shimmer rounded w-full hidden sm:block" />
                    <div className="h-2.5 sm:h-3 shimmer rounded w-2/3 hidden sm:block" />
                    <div className="h-7 sm:h-9 shimmer rounded-xl mt-2 sm:mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 px-6 rounded-2xl bg-rose-500/5 border border-rose-500/20">
              <svg className="w-10 h-10 text-rose-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-rose-300 font-semibold mb-4">{error}</p>
              <button
                onClick={loadProperties}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl">
              <svg className="w-10 h-10 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-slate-400 font-medium mb-4">No properties match your filters.</p>
              <button
                onClick={() => { setSearchTerm(""); setSelectedType("All"); setPriceRange(10000000); }}
                className="text-sm text-teal-400 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 stagger-children">
              {filtered.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onBook={handleBookClick}
                  onPurchase={(p) => navigateTo("purchase-property", { propertyId: p.id })}
                  onClick={() => navigateTo("property-detail", { propertyId: prop.id })}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Booking Modal ── */}
      {selectedProperty && (
        <BookingModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onSuccess={(msg) => showToast(msg, "success")}
          onError={(msg) => showToast(msg, "error")}
        />
      )}

      {/* ── Toast ── */}
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}

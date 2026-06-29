import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { isAdminAuthenticated, clearAdminSession } from "./AdminLoginPage";
import Toast from "../components/Toast";
import { CreatePropertyUseCase } from "../../application/usecases/CreatePropertyUseCase";
import { GetPropertiesUseCase } from "../../application/usecases/GetPropertiesUseCase";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

export default function AdminDashboard({ navigateTo }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);

  // Form State
  const [title, setTitle]               = useState("");
  const [description, setDescription]   = useState("");
  const [location, setLocation]         = useState("");
  const [price, setPrice]               = useState("");
  const [propertyType, setPropertyType] = useState("Villa");
  const [bedroom, setBedroom]           = useState("4");
  const [bathroom, setBathroom]         = useState("3");
  const [imageUrl, setImageUrl]         = useState("");
  const [formLoading, setFormLoading]   = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: "", type: "info" });
  const showToast = useCallback((msg, type = "success") => setToast({ message: msg, type }), []);
  const clearToast = useCallback(() => setToast({ message: "", type: "info" }), []);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GetPropertiesUseCase.execute();
      setProperties(data);
    } catch {
      showToast("Failed to load property listings.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Guard: if admin session is missing, redirect to admin login
    if (!isAdminAuthenticated()) {
      clearAdminSession();
      navigateTo("admin-login");
      return;
    }
    loadProperties();
  }, [loadProperties, navigateTo]);

  if (!isAdminAuthenticated()) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        title,
        description,
        location,
        price,
        propertyType,
        bedroom,
        bathroom,
        images: imageUrl
          ? [imageUrl]
          : [FALLBACK_IMAGE],
      };

      await CreatePropertyUseCase.execute(payload, user.token);
      showToast("Property published successfully!", "success");

      // Reset form
      setTitle(""); setDescription(""); setLocation(""); setPrice("");
      setPropertyType("Villa"); setBedroom("4"); setBathroom("3"); setImageUrl("");

      await loadProperties();
    } catch (err) {
      showToast(err?.message || "Failed to publish property.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Metrics
  const totalListings = properties.length;
  const avgPrice      = totalListings > 0
    ? Math.round(properties.reduce((s, p) => s + p.price, 0) / totalListings)
    : 0;
  const types = [...new Set(properties.map((p) => p.propertyType))];

  return (
    <div className="bg-[#0f172a] min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-10 border-b border-slate-900">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Admin <span className="text-teal-400">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              Manage listings, review metrics, and organize client tours
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-xl border border-slate-850">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">Live · Secure Connection</span>
            </div>
            <button
              onClick={() => {
                clearAdminSession();
                navigateTo("landing");
              }}
              className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/10 border border-rose-500/30 rounded-lg transition-all duration-300 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-[#0b0f19] border border-slate-900 p-6 rounded-2xl">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Total Listings</p>
            <p className="text-4xl font-extrabold text-white">{loading ? "–" : totalListings}</p>
          </div>
          <div className="bg-[#0b0f19] border border-slate-900 p-6 rounded-2xl">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Average Price</p>
            <p className="text-4xl font-extrabold text-teal-400">
              {loading ? "–" : `$${avgPrice.toLocaleString()}`}
            </p>
          </div>
          <div className="bg-[#0b0f19] border border-slate-900 p-6 rounded-2xl">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Authorized Admin</p>
            <p className="text-sm font-semibold text-indigo-400 truncate mt-1">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {types.map((t) => (
                <span key={t} className="px-2 py-0.5 text-[9px] font-bold text-slate-400 bg-slate-900 rounded-full border border-slate-800">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Create Form (2-col span) */}
          <div className="lg:col-span-2 bg-[#0b0f19]/80 border border-slate-900 p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-7">Create New Property Listing</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Title + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Property Title
                  </label>
                  <input
                    type="text" required value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Created Property For List"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Location
                  </label>
                  <input
                    type="text" required value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. List City"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  rows={3} required value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ensure created appears in get_properties function"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 text-sm resize-none transition-all"
                />
              </div>

              {/* Row 3: Price + Type + Bed + Bath */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number" required value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="450"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Type
                  </label>
                  <select
                    value={propertyType} onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500 text-sm transition-all"
                  >
                    {["Villa","Apartment","Penthouse","Mansion","House"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number" required min="1" value={bedroom}
                    onChange={(e) => setBedroom(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number" required min="1" value={bathroom}
                    onChange={(e) => setBathroom(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Image URL <span className="text-slate-600 normal-case">(optional — leave blank for default)</span>
                </label>
                <input
                  type="url" value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 text-sm transition-all"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit" disabled={formLoading}
                  className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 shadow-xl shadow-teal-500/10 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Publishing...
                    </>
                  ) : "Publish Property"}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar: Active Listings */}
          <div className="bg-[#0b0f19]/80 border border-slate-900 p-6 rounded-3xl flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Active Listings</h3>
              <button
                onClick={loadProperties}
                className="text-xs text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="space-y-3 flex-1">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950">
                    <div className="w-12 h-12 rounded-lg shimmer flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 shimmer rounded w-3/4" />
                      <div className="h-2 shimmer rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10 flex-1">No listings yet.</p>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-0.5">
                {properties.map((prop) => (
                  <div key={prop.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-900 hover:border-slate-800 transition-all">
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{prop.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{prop.location}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-extrabold text-teal-400">${prop.price.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-600 mt-0.5">{prop.propertyType}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}

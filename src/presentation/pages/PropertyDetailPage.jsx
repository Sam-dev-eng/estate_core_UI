import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { GetPropertiesUseCase } from "../../application/usecases/GetPropertiesUseCase";
import BookingModal from "../components/BookingModal";
import Toast from "../components/Toast";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

export default function PropertyDetailPage({ propertyId, navigateTo, routeParams }) {
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Modal
  const [showBooking, setShowBooking] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: "", type: "info" });
  const showToast = useCallback((msg, type = "success") => setToast({ message: msg, type }), []);
  const clearToast = useCallback(() => setToast({ message: "", type: "info" }), []);

  const fetchProperty = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const all = await GetPropertiesUseCase.execute();
      const match = all.find((p) => String(p.id) === String(propertyId));
      if (match) {
        setProperty(match);
      } else {
        setError("Property not found.");
      }
    } catch (err) {
      setError("Failed to retrieve property details.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  // Handle post-login auto-open booking modal redirect
  useEffect(() => {
    if (property && routeParams?.autoOpenBooking) {
      setShowBooking(true);
    }
  }, [property, routeParams]);

  // Handle book tour press
  const handleBookPress = () => {
    if (!user) {
      // Store redirect target so we come back here or auto-open
      window.redirectTarget = "book-tour";
      window.redirectTargetParams = { property };
      window.redirectFromPage = "property-detail";
      navigateTo("login");
    } else {
      setShowBooking(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-teal-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#0f172a] px-4">
        <div className="max-w-md w-full text-center py-12 px-6 rounded-2xl bg-rose-500/5 border border-rose-500/20">
          <svg className="w-12 h-12 text-rose-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-rose-300 font-semibold mb-6">{error || "Property not found."}</p>
          <button
            onClick={() => navigateTo("landing")}
            className="px-6 py-3 font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [FALLBACK_IMAGE];

  return (
    <div className="bg-[#0f172a] min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigateTo("landing")}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 mb-8 transition-colors cursor-pointer group"
        >
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column - Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="h-[400px] sm:h-[480px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-900 shadow-xl relative">
              <img
                src={images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (e.target.src !== FALLBACK_IMAGE) e.target.src = FALLBACK_IMAGE;
                }}
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 text-xs font-bold bg-[#0f172a]/80 backdrop-blur-md text-teal-400 rounded-full border border-teal-500/20">
                  {property.propertyType}
                </span>
              </div>
              {property.status && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-full">
                    {property.status}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Grid (if multiple images exist) */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="h-24 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Info Card */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight leading-snug mb-3">
                  {property.title}
                </h1>
                <p className="text-slate-400 text-sm flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.location}
                </p>
              </div>

              {/* Price Tag */}
              <div className="py-4 border-y border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Asking Price</span>
                <span className="text-2xl font-extrabold text-teal-400">${property.price.toLocaleString()}</span>
              </div>

              {/* Specifications */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 border-r border-slate-900/60">
                  <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500">Bedrooms</span>
                  <span className="block text-xl font-bold text-white mt-1">4</span>
                </div>
                <div className="text-center p-3">
                  <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500">Bathrooms</span>
                  <span className="block text-xl font-bold text-white mt-1">3</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">About Property</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">
                  {property.description || "No description provided by the administrator."}
                </p>
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                <button
                  onClick={handleBookPress}
                  className="w-full py-4 text-center font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
                >
                  Book Tour Inspection
                </button>
                <button
                  onClick={() => navigateTo("purchase-property", { propertyId: property.id })}
                  className="w-full py-4 text-center font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-teal-500/10 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Buy Now / Make Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal
          property={property}
          onClose={() => setShowBooking(false)}
          onSuccess={(msg) => showToast(msg, "success")}
          onError={(msg) => showToast(msg, "error")}
        />
      )}

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}

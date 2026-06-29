import React, { useState, useEffect, useCallback } from "react";
import { GetPropertiesUseCase } from "../../application/usecases/GetPropertiesUseCase";
import { useAuth } from "../context/useAuth";

const WHATSAPP_NUMBER = "2349164539060"; // international format (234 = Nigeria country code)

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

function formatCurrency(val) {
  const num = parseFloat(String(val).replace(/,/g, ""));
  if (isNaN(num)) return val;
  return num.toLocaleString("en-US");
}

export default function PurchasePropertyPage({ propertyId, navigateTo }) {
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    offerAmount: "",
    message: "",
  });

  // Sync user info if it changes (e.g. auth finishes loading)
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  /* ── Fetch property details ─────────────────────────────── */
  const fetchProperty = useCallback(async () => {
    setLoading(true);
    try {
      const all = await GetPropertiesUseCase.execute();
      const match = all.find((p) => String(p.id) === String(propertyId));
      if (match) {
        setProperty(match);
        setForm((prev) => ({
          ...prev,
          offerAmount: match.price ? formatCurrency(match.price) : "",
        }));
      }
    } catch {
      /* silently fail — user can still fill form manually */
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  /* ── Validation ─────────────────────────────────────────── */
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!form.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) {
      errs.phone = "Please enter a valid phone number.";
    }
    if (!form.offerAmount.trim()) errs.offerAmount = "Offer amount is required.";
    return errs;
  };

  /* ── Handle input ───────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleOfferBlur = () => {
    const raw = form.offerAmount.replace(/,/g, "");
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      setForm((prev) => ({ ...prev, offerAmount: formatCurrency(num) }));
    }
  };

  /* ── Submit → WhatsApp ──────────────────────────────────── */
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    const propertyTitle = property ? property.title : `Property ID: ${propertyId}`;
    const propertyLocation = property ? property.location : "N/A";
    const askingPrice = property
      ? `₦${formatCurrency(property.price)}`
      : "N/A";

    const waMessage = encodeURIComponent(
      `🏡 *PROPERTY PURCHASE ENQUIRY*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Hello! I am interested in purchasing a property listed on *Estate Core* and would like to proceed with making a formal offer. Please find my details below:\n\n` +
      `*👤 Buyer Information*\n` +
      `• Name: ${form.name.trim()}\n` +
      `• Email: ${form.email.trim()}\n` +
      `• Phone: ${form.phone.trim()}\n\n` +
      `*🏠 Property Details*\n` +
      `• Property: ${propertyTitle}\n` +
      `• Location: ${propertyLocation}\n` +
      `• Asking Price: ${askingPrice}\n\n` +
      `*💰 My Offer*\n` +
      `• Offer Amount: ₦${form.offerAmount.trim()}\n\n` +
      (form.message.trim()
        ? `*📝 Additional Message*\n${form.message.trim()}\n\n`
        : "") +
      `I look forward to your prompt response and hope we can proceed smoothly.\n\n` +
      `Thank you! 🙏`
    );

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }, 800);
  };

  /* ── Loading skeleton ───────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b13] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-teal-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading property info…</p>
        </div>
      </div>
    );
  }

  /* ── Success screen ─────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#080b13] flex items-center justify-center px-4">
        <div
          className="max-w-md w-full text-center animate-slide-up"
          style={{ animationFillMode: "both" }}
        >
          {/* Animated checkmark */}
          <div className="w-24 h-24 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(45,212,191,0.2)]">
            <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Enquiry Sent!</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Your purchase enquiry has been forwarded to our agent on WhatsApp.
            They'll get back to you shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigateTo("property-detail", { propertyId })}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
            >
              Back to Property
            </button>
            <button
              onClick={() => navigateTo("landing")}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 shadow-lg shadow-teal-500/10 transition-all cursor-pointer"
            >
              Browse More Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imgSrc =
    property?.images?.length > 0 ? property.images[0] : FALLBACK_IMAGE;

  return (
    <div className="min-h-screen bg-[#080b13] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigateTo("property-detail", { propertyId })}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 mb-10 transition-colors cursor-pointer group"
        >
          <svg
            className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Property Details
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* ── Left: Property summary card ──────────────── */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
            <div className="glass-card rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl sticky top-24">
              <div className="h-52 relative overflow-hidden">
                <img
                  src={imgSrc}
                  alt={property?.title || "Property"}
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
                  onError={(e) => {
                    if (e.target.src !== FALLBACK_IMAGE) e.target.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060912]/90 via-transparent to-transparent" />
                {property?.propertyType && (
                  <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold bg-[#0f172a]/80 backdrop-blur-md text-teal-400 rounded-full border border-teal-500/20">
                    {property.propertyType}
                  </span>
                )}
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-extrabold text-white text-lg leading-snug">
                    {property?.title || `Property #${propertyId}`}
                  </h3>
                  {property?.location && (
                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.location}
                    </p>
                  )}
                </div>

                {property?.price && (
                  <div className="py-3 border-t border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Asking Price</span>
                    <span className="text-xl font-extrabold text-teal-400">
                      ₦{formatCurrency(property.price)}
                    </span>
                  </div>
                )}

                {/* WhatsApp badge */}
                <div className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded-xl px-3 py-2">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L0 24l6.305-1.654A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.893 0-3.658-.53-5.157-1.447l-.369-.222-3.743.982.999-3.648-.242-.374A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  <span className="text-xs text-green-400 font-medium">
                    Agent notified via WhatsApp
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Purchase form ──────────────────────── */}
          <div className="lg:col-span-3 animate-slide-up" style={{ animationDelay: "0.12s", animationFillMode: "both" }}>
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 text-teal-400 text-xs font-semibold mb-4">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Secure Purchase Enquiry
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Make an Offer
              </h1>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Fill in your details below and we'll connect you directly with
                our agent on WhatsApp to finalise your purchase.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Name */}
              <FormField
                id="purchase-name"
                label="Full Name"
                required
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                }
                error={errors.name}
              >
                <input
                  id="purchase-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Chukwuemeka Okonkwo"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass(errors.name)}
                />
              </FormField>

              {/* Email */}
              <FormField
                id="purchase-email"
                label="Email Address"
                required
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                }
                error={errors.email}
              >
                <input
                  id="purchase-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. buyer@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass(errors.email)}
                />
              </FormField>

              {/* Phone */}
              <FormField
                id="purchase-phone"
                label="Phone Number"
                required
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                }
                error={errors.phone}
              >
                <input
                  id="purchase-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="e.g. 08012345678"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass(errors.phone)}
                />
              </FormField>

              {/* Offer Amount */}
              <FormField
                id="purchase-offer"
                label="Offer Amount (₦)"
                required
                hint="You may adjust from the asking price"
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                }
                error={errors.offerAmount}
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
                    ₦
                  </span>
                  <input
                    id="purchase-offer"
                    name="offerAmount"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={form.offerAmount}
                    onChange={handleChange}
                    onBlur={handleOfferBlur}
                    className={`${inputClass(errors.offerAmount)} pl-8`}
                  />
                </div>
              </FormField>

              {/* Additional message (optional) */}
              <FormField
                id="purchase-message"
                label="Additional Message"
                hint="Optional — any extra context for the agent"
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                }
              >
                <textarea
                  id="purchase-message"
                  name="message"
                  rows={3}
                  placeholder="I would like to schedule a physical inspection first before finalising the deal…"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all resize-none"
                />
              </FormField>

              {/* Privacy notice */}
              <p className="text-xs text-slate-500 leading-relaxed">
                🔒 Your information is only shared with our certified agent and is
                used solely to process your purchase enquiry.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                id="purchase-submit-btn"
                className="w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-green-500/15 active:scale-[0.99] transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Preparing your enquiry…
                  </>
                ) : (
                  <>
                    {/* WhatsApp icon */}
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L0 24l6.305-1.654A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.893 0-3.658-.53-5.157-1.447l-.369-.222-3.743.982.999-3.648-.242-.374A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    Send Purchase Enquiry via WhatsApp
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper components ─────────────────────────────────────── */

function FormField({ id, label, required, hint, icon, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
        {label}
        {required && <span className="text-rose-400">*</span>}
        {hint && <span className="ml-auto text-slate-600 normal-case font-normal tracking-normal">{hint}</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1 animate-slide-down">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError) {
  return [
    "w-full bg-slate-900/60 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600",
    "focus:outline-none focus:ring-1 transition-all",
    hasError
      ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
      : "border-slate-700/60 focus:border-teal-500/60 focus:ring-teal-500/30",
  ].join(" ");
}

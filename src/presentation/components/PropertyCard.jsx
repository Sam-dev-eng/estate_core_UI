import React from "react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

export default function PropertyCard({ property, onBook, onClick }) {
  const displayImage = property.images?.[0] || FALLBACK_IMAGE;

  return (
    <article
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl bg-[#0b0e17] border border-slate-800/60 overflow-hidden hover:border-slate-700 hover:-translate-y-1.5 transition-all duration-300 shadow-lg shadow-black/35 animate-slide-up cursor-pointer"
    >
      {/* Image */}
      <div className="h-36 sm:h-56 relative overflow-hidden bg-slate-950 flex-shrink-0">
        <img
          src={displayImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            if (e.target.src !== FALLBACK_IMAGE) e.target.src = FALLBACK_IMAGE;
          }}
          loading="lazy"
        />
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17]/85 via-transparent to-transparent" />

        {/* Type Badge */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold bg-[#05070f]/85 backdrop-blur-md text-teal-400 rounded-full border border-teal-500/20">
            {property.propertyType}
          </span>
        </div>

        {/* Status Badge */}
        {property.status && (
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold bg-indigo-500/90 text-white rounded-full">
              {property.status}
            </span>
          </div>
        )}

        {/* Price overlay on image bottom */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3">
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-extrabold bg-[#0b0e17]/90 backdrop-blur-sm text-teal-400 rounded-xl border border-teal-500/20">
            ${property.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-1 mb-0.5 sm:mb-1">
            {property.title}
          </h3>

          <p className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1 mb-2 sm:mb-3">
            <svg className="w-3 h-3 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.location}
          </p>

          <p className="text-slate-400 text-[11px] sm:text-xs line-clamp-2 leading-relaxed mb-3 sm:mb-5 hidden sm:block">
            {property.description}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onBook(property);
          }}
          className="w-full py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-semibold rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-teal-500 hover:text-white hover:border-teal-500 active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          Book Tour
        </button>
      </div>
    </article>
  );
}


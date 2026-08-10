import React from 'react';
import { Phone, Calculator, ShieldCheck, Sparkles, CheckCircle2, Star, Navigation } from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const Hero = ({ onGetEstimateClick, onContactClick }) => {
  const { banner, contactInfo, mapInfo } = useCMS();

  const lat = mapInfo?.latitude || '26.8530';
  const lng = mapInfo?.longitude || '81.0003';
  const address = mapInfo?.address || contactInfo?.address || 'Lucknow';

  const directionsUrl = (lat && lng)
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <section id="home" className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden min-h-[90vh] flex items-center justify-center">
      {/* Background Image Container with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={banner.bgImage || '/assets/hero.jpg'}
          alt="Painter in Lucknow - Munnalal House Painter & Wall Painting Services Lucknow"
          decoding="async"
          className="w-full h-full object-cover object-center scale-105 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-900/60 dark:from-slate-950/95 dark:via-slate-950/90 dark:to-slate-950/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/20 border border-brand-400/30 backdrop-blur-md text-brand-300 font-semibold text-xs sm:text-sm tracking-wide uppercase stats-count">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>{banner.badgeText}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight font-outfit">
              {banner.title}
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
              {banner.subtitle}
            </p>

            {/* Key Value Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-slate-200 text-sm font-medium">
              {(banner.bullets || []).map((bullet, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <a
                href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-base shadow-xl shadow-brand-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                <Phone className="w-5 h-5" />
                <span>Call Now: {contactInfo.phone}</span>
              </a>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 backdrop-blur-md text-white font-bold text-base shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                <Navigation className="w-5 h-5 text-blue-300" />
                <span>Get Directions</span>
              </a>

              <button
                onClick={onGetEstimateClick}
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-bold text-base hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                <Calculator className="w-5 h-5 text-brand-400" />
                <span>Free Estimate</span>
              </button>
            </div>

            {/* Rating Badge */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                <strong className="text-white font-bold">{banner.ratingScore}</strong> {banner.ratingSubtext}
              </p>
            </div>

          </div>

          {/* Right Column Highlights Card */}
          <div className="lg:col-span-5">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-brand-400" />
                  Why Choose Us?
                </h3>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  Verified Local Service
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {(banner.stats || []).map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                    <div className="text-3xl font-black text-brand-400 font-outfit stats-count">{stat.value}</div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Prompt & Directions Button */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-900/40 to-slate-800 border border-brand-500/30 space-y-3">
                <div className="text-sm font-semibold text-white">Visit Munnalal Painter Office</div>
                <div className="text-xs text-slate-300">{address}</div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={onContactClick}
                    className="py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Book Visit
                  </button>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

import React, { useState } from 'react';
import { 
  ArrowLeft, CheckCircle2, Sparkles, Calculator, Phone, MessageSquare, 
  ShieldCheck, MapPin, Tag, Layers, ArrowRight, Send, Check
} from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const ServicePage = ({ serviceSlug, onBack, onNavigateContact }) => {
  const { services, contactInfo, addEstimate } = useCMS();

  // Find target service by slug or title match
  const service = services.find(s => 
    s.slug === serviceSlug || 
    s.title.toLowerCase().replace(/\s+/g, '-') === serviceSlug ||
    s.title.toLowerCase().includes(serviceSlug.replace(/-/g, ' '))
  ) || services[0];

  // Estimate calculator state inside service page
  const [sqft, setSqft] = useState(1000);
  const [quality, setQuality] = useState('Standard');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [estSubmitted, setEstSubmitted] = useState(false);

  // Rate math
  const minRate = service.minRate || 14;
  const maxRate = service.maxRate || 28;
  const qualityMultiplier = quality === 'Budget' ? 0.85 : quality === 'Luxury' ? 1.35 : 1.0;
  
  const estimatedMin = Math.round(sqft * minRate * qualityMultiplier);
  const estimatedMax = Math.round(sqft * maxRate * qualityMultiplier);

  const handleEstimateSubmit = (e) => {
    e.preventDefault();
    if (!custName || !custPhone) return;

    addEstimate({
      name: custName,
      mobile: custPhone,
      address: 'Lucknow',
      workType: service.title,
      squareFeet: sqft,
      quality,
      estimatedCostMin: estimatedMin,
      estimatedCostMax: estimatedMax
    });
    setEstSubmitted(true);
  };

  const cleanPhone = (p) => p ? p.replace(/[^0-9+]/g, '') : '';

  // Design images list
  const designs = service.designs && service.designs.length > 0 
    ? service.designs 
    : [service.image, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'].filter(Boolean);

  const [activeImage, setActiveImage] = useState(designs[0] || service.image);

  return (
    <div className="pt-24 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm hover:bg-brand-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Services</span>
          </button>

          <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-bold text-xs uppercase tracking-wider">
            Dedicated Service Details
          </span>
        </div>

        {/* Hero Banner for this Specific Service */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          
          {/* Left info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{service.category || 'Painting Service'}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-outfit leading-tight">
              {service.title} in Lucknow
            </h1>

            {/* Price Per Sq. Ft Rate Badge */}
            <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
              <Tag className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <div>
                <div className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">Rate Per Sq. Ft</div>
                <div className="text-2xl font-black font-outfit text-amber-700 dark:text-amber-300">
                  {service.priceRange || `₹${minRate} - ₹${maxRate} / sq.ft`}
                </div>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              {service.longDescription || service.description}
            </p>

            {/* Bullet features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(service.features || []).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                  <span>{typeof feat === 'string' ? feat : feat.name}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href={`tel:${cleanPhone(contactInfo.phone)}`}
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/20 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call Helpline: {contactInfo.phone}</span>
              </a>

              <a
                href={`https://wa.me/${cleanPhone(contactInfo.whatsapp)}?text=Hi%20Munnalal%20Painter,%20I%20want%20to%20inquire%20about%20${encodeURIComponent(service.title)}.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Quote</span>
              </a>
            </div>

          </div>

          {/* Right Media Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="h-80 sm:h-96 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-slate-900">
              <img
                src={activeImage}
                alt={`${service.title} in Lucknow - Professional House Painter & Wall Painting Services`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Thumbnails */}
            {designs.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {designs.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-transform ${
                      activeImage === img ? 'border-brand-500 scale-105 shadow-md' : 'border-slate-300 dark:border-slate-700 opacity-70'
                    }`}
                  >
                    <img src={img} alt={`${service.title} Design sample ${idx + 1} - Painter in Lucknow`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Service Specific Price Estimate Calculator */}
        <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs uppercase tracking-wider">
              Service Price Estimator
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-outfit">
              Calculate {service.title} Cost in Lucknow
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Enter your room or carpet square footage to calculate estimated cost for {service.title} by expert House Painter in Lucknow.
            </p>
          </div>

          {estSubmitted ? (
            <div className="p-8 rounded-2xl bg-emerald-950/60 border border-emerald-700 text-center space-y-4 max-w-lg mx-auto">
              <Check className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-emerald-100">Estimate Request Received!</h3>
              <p className="text-xs text-emerald-300">
                Thank you <strong>{custName}</strong>. Our chief painter supervisor will call you at <strong>{custPhone}</strong> to schedule a free site visit.
              </p>
              <div className="p-4 rounded-xl bg-slate-900 text-left text-xs space-y-1">
                <div>Service: <strong>{service.title}</strong></div>
                <div>Area: <strong>{sqft} sq.ft</strong></div>
                <div>Est Cost: <strong className="text-brand-400">₹{estimatedMin.toLocaleString()} - ₹{estimatedMax.toLocaleString()}</strong></div>
              </div>
              <button
                onClick={() => setEstSubmitted(false)}
                className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase"
              >
                Calculate Another Estimate
              </button>
            </div>
          ) : (
            <form onSubmit={handleEstimateSubmit} className="max-w-3xl mx-auto space-y-6">
              
              {/* Quality selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Budget', 'Standard', 'Luxury'].map(q => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                      quality === q
                        ? 'bg-brand-500 text-white border-brand-500 shadow-lg'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {q} Finish Grade
                  </button>
                ))}
              </div>

              {/* Area Slider */}
              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>Covered Wall / Carpet Area</span>
                  <span className="text-brand-400 text-lg font-black">{sqft} Sq.Ft</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="50"
                  value={sqft}
                  onChange={e => setSqft(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              {/* Live Cost Output */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-950/60 to-slate-800 border border-brand-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-brand-400 font-bold uppercase">Estimated Budget for {service.title}</div>
                  <div className="text-3xl font-black text-white font-outfit mt-1">
                    ₹{estimatedMin.toLocaleString()} - ₹{estimatedMax.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Rate: ₹{minRate} - ₹{maxRate} / sq.ft incl. labor & Asian Paints materials.</div>
                </div>

                <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                  Instant Discount Available
                </div>
              </div>

              {/* Contact inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Verma"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={custPhone}
                    onChange={e => setCustPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>Submit Estimate & Lock Rate</span>
              </button>

            </form>
          )}
        </div>

        {/* SEO Related Services Internal Links */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-outfit">
            Other Wall Painting Services in Lucknow
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {services.filter(s => s.title !== service.title).map(other => {
              const otherSlug = other.slug || other.title.toLowerCase().replace(/\s+/g, '-');
              return (
                <a
                  key={other.id || otherSlug}
                  href={`#${otherSlug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = `/service/${otherSlug}`;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white transition-colors text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-between"
                >
                  <span>{other.title} Lucknow</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ServicePage;

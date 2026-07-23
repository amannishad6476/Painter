import React, { useState } from 'react';
import { Calculator, CheckCircle2, Phone, Sparkles, Send } from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const PriceEstimate = ({ preselectedService }) => {
  const { addEstimate, contactInfo } = useCMS();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    workType: preselectedService || 'House Painting',
    squareFeet: 1000,
    quality: 'Standard'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const workTypes = [
    { label: 'House Painting (Full Home)', rateMin: 14, rateMax: 28 },
    { label: 'Interior Painting', rateMin: 12, rateMax: 26 },
    { label: 'Exterior Painting', rateMin: 16, rateMax: 34 },
    { label: 'Texture Design', rateMin: 45, rateMax: 110 },
    { label: 'Wall Putty', rateMin: 8, rateMax: 15 },
    { label: 'Waterproofing', rateMin: 32, rateMax: 70 },
    { label: 'POP Design', rateMin: 60, rateMax: 140 }
  ];

  // Dynamic cost estimate math
  const selectedTypeObj = workTypes.find(w => w.label.includes(formData.workType) || formData.workType.includes(w.label)) || workTypes[0];
  const qualityMultiplier = formData.quality === 'Budget' ? 0.85 : formData.quality === 'Luxury' ? 1.35 : 1.0;
  
  const estimatedMin = Math.round(formData.squareFeet * selectedTypeObj.rateMin * qualityMultiplier);
  const estimatedMax = Math.round(formData.squareFeet * selectedTypeObj.rateMax * qualityMultiplier);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.mobile) {
      setError('Please fill in your name and mobile number.');
      return;
    }

    setLoading(true);
    try {
      const estimateData = {
        ...formData,
        estimatedCostMin: estimatedMin,
        estimatedCostMax: estimatedMax
      };
      addEstimate(estimateData);
      setLoading(false);
      setResult(estimateData);
    } catch (err) {
      setLoading(false);
      setError('Error submitting estimate. Please try calling directly.');
    }
  };

  const cleanPhone = (p) => p ? p.replace(/[^0-9+]/g, '') : '';

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="px-3.5 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-bold text-xs uppercase tracking-wider">
            Instant Cost Estimator
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-outfit">
            Get Your Free Painting Price Estimate
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Select your service & square footage to calculate estimated cost. Submit to lock in exclusive discount offers in Lucknow!
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-2xl">
          
          {result ? (
            /* Success Response State */
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">
                Estimate Request Received!
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Thank you, <strong className="text-brand-500">{result.name}</strong>. Our chief supervisor in Lucknow will call you at <strong>{result.mobile}</strong> shortly to confirm your free site inspection.
              </p>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-lg mx-auto text-left space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-500 border-b pb-2 dark:border-slate-700">
                  <span>Selected Work:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{result.workType}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-500 border-b pb-2 dark:border-slate-700">
                  <span>Covered Area:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{result.squareFeet} sq.ft</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-500">
                  <span>Estimated Cost Range:</span>
                  <span className="text-brand-600 dark:text-brand-400 font-extrabold text-lg">
                    ₹{result.estimatedCostMin.toLocaleString()} - ₹{result.estimatedCostMax.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <a
                  href={`tel:${cleanPhone(contactInfo.phone)}`}
                  className="px-6 py-3 rounded-xl bg-brand-500 text-white font-bold text-sm shadow-md flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {contactInfo.phone} Now</span>
                </a>
                <button
                  onClick={() => setResult(null)}
                  className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm"
                >
                  Recalculate Estimate
                </button>
              </div>
            </div>
          ) : (
            /* Form Calculator State */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="p-3.5 rounded-xl bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    1. Select Work Type
                  </label>
                  <select
                    value={formData.workType}
                    onChange={e => setFormData({ ...formData, workType: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="House Painting">House Painting (Full Home)</option>
                    <option value="Interior Painting">Interior Painting</option>
                    <option value="Exterior Painting">Exterior Painting</option>
                    <option value="Texture Design">Texture Design</option>
                    <option value="Wall Putty">Wall Putty</option>
                    <option value="Waterproofing">Waterproofing</option>
                    <option value="POP Design">POP Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    2. Quality / Finish Grade
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Budget', 'Standard', 'Luxury'].map(q => (
                      <button
                        type="button"
                        key={q}
                        onClick={() => setFormData({ ...formData, quality: q })}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                          formData.quality === q
                            ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slider Area */}
              <div className="space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Total Carpet / Wall Area (Sq.Ft)</span>
                  <span className="text-brand-600 dark:text-brand-400 text-lg font-extrabold">{formData.squareFeet} Sq.Ft</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="50"
                  value={formData.squareFeet}
                  onChange={e => setFormData({ ...formData, squareFeet: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>200 sq.ft (1 Room)</span>
                  <span>1,000 sq.ft (2BHK)</span>
                  <span>2,000 sq.ft (3BHK)</span>
                  <span>5,000 sq.ft (Villa)</span>
                </div>
              </div>

              {/* Live Estimate Card Display */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-brand-400 font-bold uppercase tracking-wider">Estimated Project Budget Range</div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-outfit mt-1">
                    ₹{estimatedMin.toLocaleString()} - ₹{estimatedMax.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Includes labor, surface prep, dust-free sanding & Asian Paints materials.</div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 whitespace-nowrap">
                  ✨ Instant Offer Active
                </div>
              </div>

              {/* Personal Details inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all"
              >
                {loading ? (
                  <span>Calculating...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit & Claim Free Inspection</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};

export default PriceEstimate;

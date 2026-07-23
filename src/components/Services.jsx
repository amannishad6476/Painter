import React, { useState } from 'react';
import { Home, Paintbrush, Sun, Palette, Layers, Droplets, Grid, CheckCircle, ArrowRight, Sparkles, Eye, Tag } from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const iconMap = {
  Home: Home,
  Paintbrush: Paintbrush,
  Sun: Sun,
  Palette: Palette,
  Layers: Layers,
  Droplets: Droplets,
  Grid: Grid,
  Sparkles: Sparkles
};

const Services = ({ onSelectServiceForEstimate, onOpenServicePage }) => {
  const { services } = useCMS();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    'All',
    'House Painting',
    'Interior Painting',
    'Exterior Painting',
    'Texture Painting',
    'Wall Putty',
    'Waterproofing',
    'POP Design',
    'Wood Polish'
  ];

  const filteredServices = activeCategory === 'All'
    ? services
    : services.filter(s => {
        if (!s.category && !s.title) return false;
        const catLower = (s.category || s.title).toLowerCase().trim();
        const filterLower = activeCategory.toLowerCase().trim();
        return catLower === filterLower || catLower.includes(filterLower.replace(' painting', ''));
      });

  return (
    <section id="services" className="py-20 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
            Our Core Painting Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-outfit">
            Comprehensive Painting & Decor Solutions
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            View detailed service pages for House Painting, Interior, Exterior, Texture, Wall Putty, and Waterproofing with price per sq.ft rates and designs.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map(service => {
            const IconComponent = iconMap[service.iconName] || Paintbrush;
            const slug = service.slug || service.title.toLowerCase().replace(/\s+/g, '-');

            return (
              <div
                key={service.id || slug}
                className="group relative rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:shadow-2xl hover:border-brand-400/50 transition-all duration-300"
              >
                <div>
                  {/* Service Top Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                      {service.category || 'Service'}
                    </span>
                  </div>

                  {/* Image cover */}
                  {service.image && (
                    <div 
                      onClick={() => onOpenServicePage && onOpenServicePage(slug)}
                      className="h-44 rounded-2xl overflow-hidden mb-4 cursor-pointer relative group/img"
                    >
                      <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 font-bold text-xs shadow-lg flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-brand-500" />
                          <span>View Designs & Page</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Title & Price per Sq. Ft */}
                  <h3 
                    onClick={() => onOpenServicePage && onOpenServicePage(slug)}
                    className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors cursor-pointer"
                  >
                    {service.title}
                  </h3>

                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl w-fit border border-amber-200 dark:border-amber-800/60">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span>Rate: {service.priceRange || service.pricePerSqFt || '₹14 - ₹30 / sq.ft'}</span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Bullet features */}
                  <div className="space-y-2 mb-8">
                    {service.features && (Array.isArray(service.features) ? service.features : service.features.split(',')).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{typeof feat === 'string' ? feat.trim() : feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    onClick={() => onOpenServicePage && onOpenServicePage(slug)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Page</span>
                  </button>

                  <button
                    onClick={() => onSelectServiceForEstimate(service.title)}
                    className="w-full py-2.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Get Estimate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Services;

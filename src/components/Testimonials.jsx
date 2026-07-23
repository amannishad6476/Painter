import React from 'react';
import { Star, Quote, MapPin, CheckCircle2 } from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const Testimonials = () => {
  const { testimonials } = useCMS();

  return (
    <section id="testimonials" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors border-t border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
            Client Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-outfit">
            What Homeowners in Lucknow Say
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Real feedback from satisfied home and business owners across Gomti Nagar, Hazratganj, Alambagh, and Indira Nagar.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-brand-500/10 group-hover:text-brand-500/20 transition-colors" />

              <div className="space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>

                {/* Tag */}
                {item.projectCategory && (
                  <span className="inline-block px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider">
                    {item.projectCategory}
                  </span>
                )}

                {/* Comment */}
                <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <img
                  src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-500 shadow-md"
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-outfit">
                    {item.name}
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    {item.location}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;

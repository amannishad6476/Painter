import React, { useState } from 'react';
import { Star, Quote, MapPin, CheckCircle2, PenLine, ExternalLink } from 'lucide-react';
import { useCMS } from '../context/cmsContext';
import ReviewModal from './ReviewModal';

// Google Maps Review Link — update the Place ID when registered on Google Business
const GOOGLE_REVIEW_URL = 'https://g.page/r/lucknowpainter/review';

const Testimonials = () => {
  const { testimonials } = useCMS();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <>
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} />

      <section id="testimonials" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            {/* Write a Review */}
            <button
              id="write-review-btn"
              onClick={() => setIsReviewModalOpen(true)}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <PenLine className="w-4 h-4 group-hover:rotate-6 transition-transform" />
              Write a Review
            </button>

            {/* Review on Google */}
            <a
              id="google-review-btn"
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Google G Logo */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Review us on Google
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
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
                    src={item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=d97706&color=fff&size=200`}
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
    </>
  );
};

export default Testimonials;

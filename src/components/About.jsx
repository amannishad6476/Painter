import React from 'react';
import { Award, Shield, ThumbsUp, Clock, HeartHandshake } from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const About = () => {
  const { aboutContent } = useCMS();

  return (
    <section id="about" className="py-20 bg-slate-100 dark:bg-slate-900/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-3.5 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-bold text-xs uppercase tracking-wider">
            {aboutContent.badgeText}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-outfit">
            {aboutContent.headline}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            {aboutContent.subheading}
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <img
                src={aboutContent.featureImage || '/assets/texture.jpg'}
                alt="Luxury Painting Lucknow"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 hidden sm:block max-w-xs">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-brand-500 text-white">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-outfit">100%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{aboutContent.qualityGuarantee}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">
              {aboutContent.storyTitle}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {aboutContent.paragraph1}
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {aboutContent.paragraph2}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {(aboutContent.highlights || []).map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700">
                  <Shield className="w-5 h-5 text-brand-500" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 4-Step Process */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-outfit">
              Our Hassle-Free Painting Process
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              How we deliver flawless wall painting with zero stress for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(aboutContent.processSteps || []).map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-md hover:shadow-xl transition-shadow group"
              >
                <div className="text-4xl font-black text-brand-500/30 group-hover:text-brand-500 transition-colors font-outfit mb-3">
                  {step.num}
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;

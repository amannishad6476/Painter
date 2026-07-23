import React, { useState, useMemo } from 'react';
import { 
  MapPin, Calendar, Search, ArrowRightLeft, Sparkles, X, Share2, Play, 
  Maximize2, Video, Camera, Check, Filter, Film, Copy
} from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const Gallery = () => {
  const { gallery } = useCMS();
  
  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState('All Projects');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lightbox / Modal state
  const [activeMediaModal, setActiveMediaModal] = useState(null);
  const [sliderPositions, setSliderPositions] = useState({});
  const [shareToast, setShareToast] = useState('');

  const categories = [
    'All Projects',
    'Full House Painting',
    'Interior Painting',
    'Exterior Painting',
    'Texture Painting',
    'Wall Putty',
    'Waterproofing',
    'POP Design',
    'Wood Polish'
  ];

  // Sort latest first & apply Category Filter + Search Query
  const filteredAndSortedGallery = useMemo(() => {
    // Clone and sort latest first by createdAt or timestamp
    let items = [...gallery].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Apply category filter
    if (selectedCategory !== 'All Projects') {
      const catTarget = selectedCategory.toLowerCase().trim();
      items = items.filter(item => {
        if (!item.category) return false;
        const itemCat = item.category.toLowerCase().trim();
        return itemCat === catTarget || itemCat.includes(catTarget.replace(' painting', ''));
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.completionDate && item.completionDate.toLowerCase().includes(q))
      );
    }

    return items;
  }, [gallery, selectedCategory, searchQuery]);

  const handleSliderChange = (id, val) => {
    setSliderPositions(prev => ({ ...prev, [id]: val }));
  };

  const handleShare = async (item, e) => {
    e.stopPropagation();
    const shareUrl = window.location.href.split('#')[0] + `#project-${item.id}`;
    const shareData = {
      title: `${item.title} - Munnalal Painter Lucknow`,
      text: `Check out this ${item.category} project by Munnalal Painter in ${item.location}!`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        setShareToast('Project link copied to clipboard!');
        setTimeout(() => setShareToast(''), 3000);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShareToast('Project link copied to clipboard!');
      setTimeout(() => setShareToast(''), 3000);
    }
  };

  return (
    <section id="gallery" className="py-20 bg-slate-100 dark:bg-slate-900/60 transition-colors relative">
      
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-8 right-8 z-50 px-6 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{shareToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
            Work Portfolio & Gallery
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-outfit">
            Real Project Photos, Videos & Transformations
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Explore our real house painting work across Lucknow. Watch project videos, inspect before & after sliders, or open photos in full-screen.
          </p>
        </div>

        {/* Search Bar & Category Filters Bar */}
        <div className="space-y-6 mb-12">
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects by title, location (e.g. Gomti Nagar), or work type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm shadow-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105 ring-2 ring-brand-500 font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Portfolio / Gallery Grid */}
        {filteredAndSortedGallery.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-3">
            <Sparkles className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No projects found</h3>
            <p className="text-xs text-slate-500">
              {searchQuery ? `No matching items found for "${searchQuery}".` : 'No projects uploaded for this section yet.'}
            </p>
            <button
              onClick={() => { setSelectedCategory('All Projects'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs uppercase"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedGallery.map(item => {
              const pos = sliderPositions[item.id] !== undefined ? sliderPositions[item.id] : 50;
              const isVideo = item.mediaType === 'video' || (item.videoUrl && item.videoUrl.trim().length > 0);
              const mainImage = item.afterImage || item.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800';

              return (
                <div
                  id={`project-${item.id}`}
                  key={item.id}
                  className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-lg space-y-4 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    
                    {/* Media Display Container */}
                    <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden select-none bg-slate-900">
                      
                      {isVideo ? (
                        /* Video Player Mode */
                        <div className="relative w-full h-full group">
                          {item.videoUrl && item.videoUrl.includes('mp4') ? (
                            <video
                              src={item.videoUrl}
                              poster={mainImage}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div 
                              onClick={() => setActiveMediaModal(item)}
                              className="w-full h-full relative cursor-pointer"
                            >
                              <img src={mainImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                                <div className="w-14 h-14 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                  <Play className="w-7 h-7 fill-white ml-1" />
                                </div>
                              </div>
                            </div>
                          )}
                          <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-red-600 text-white font-bold text-[10px] uppercase shadow-md flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            <span>VIDEO</span>
                          </span>
                        </div>
                      ) : item.beforeImage ? (
                        /* Before / After Split View */
                        <div className="relative w-full h-full">
                          <img
                            src={mainImage}
                            alt={`${item.title} After`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <span className="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px] uppercase shadow-md">
                            AFTER
                          </span>

                          <div
                            className="absolute inset-0 w-full h-full overflow-hidden"
                            style={{ width: `${pos}%` }}
                          >
                            <img
                              src={item.beforeImage}
                              alt={`${item.title} Before`}
                              className="absolute inset-0 w-full h-full object-cover"
                              style={{ width: '100%', maxWidth: 'none' }}
                            />
                            <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-slate-200 font-black text-[10px] uppercase shadow-md">
                              BEFORE
                            </span>
                          </div>

                          <div
                            className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize z-20"
                            style={{ left: `${pos}%` }}
                          >
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-brand-500">
                              <ArrowRightLeft className="w-3.5 h-3.5 text-brand-600" />
                            </div>
                          </div>

                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={pos}
                            onChange={(e) => handleSliderChange(item.id, e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                          />
                        </div>
                      ) : (
                        /* Single Photo View with Fullscreen Trigger */
                        <div 
                          onClick={() => setActiveMediaModal(item)}
                          className="relative w-full h-full cursor-pointer group"
                        >
                          <img
                            src={mainImage}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-brand-500/90 text-white font-bold text-[10px] uppercase shadow-md flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>PHOTO</span>
                          </span>
                          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-4 py-2 rounded-xl bg-white/90 text-slate-900 text-xs font-bold shadow-xl flex items-center gap-1.5">
                              <Maximize2 className="w-3.5 h-3.5 text-brand-500" />
                              View Full Screen
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Top Action Overlay: Fullscreen & Share */}
                      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                        {!item.beforeImage && (
                          <button
                            onClick={() => setActiveMediaModal(item)}
                            className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
                            title="Open Fullscreen"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleShare(item, e)}
                          className="p-2 rounded-xl bg-slate-900/70 hover:bg-brand-500 text-white backdrop-blur-md transition-colors"
                          title="Share Project"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                    {/* Card Content & Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2.5 py-1 rounded-md">
                          {item.category}
                        </span>
                        {item.completionDate && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            <Calendar className="w-3 h-3 text-amber-500" />
                            {item.completionDate}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit line-clamp-2">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                        <span>{item.location || 'Lucknow'}</span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Footer Bar */}
                  <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setActiveMediaModal(item)}
                      className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>View Project Details</span>
                      <Maximize2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => handleShare(item, e)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Fullscreen Lightbox / Video Modal */}
      {activeMediaModal && (
        <div 
          onClick={() => setActiveMediaModal(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center overflow-y-auto"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl w-full rounded-3xl bg-slate-900 border border-slate-800 text-white overflow-hidden shadow-2xl space-y-4 p-6 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveMediaModal(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors z-30"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Media Box */}
            <div className="max-h-[60vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              {activeMediaModal.mediaType === 'video' || (activeMediaModal.videoUrl && activeMediaModal.videoUrl.length > 0) ? (
                <video
                  src={activeMediaModal.videoUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[60vh] object-contain"
                />
              ) : (
                <img
                  src={activeMediaModal.afterImage || activeMediaModal.image}
                  alt={activeMediaModal.title}
                  className="w-full max-h-[60vh] object-contain"
                />
              )}
            </div>

            {/* Content info inside modal */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-500 text-white font-bold text-xs uppercase tracking-wider">
                  {activeMediaModal.category}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {activeMediaModal.completionDate || 'Recent Project'}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white font-outfit">
                {activeMediaModal.title}
              </h3>

              <div className="flex items-center gap-1.5 text-sm text-brand-400 font-medium">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>{activeMediaModal.location || 'Lucknow'}</span>
              </div>

              {activeMediaModal.description && (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeMediaModal.description}
                </p>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={(e) => handleShare(activeMediaModal, e)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Project Link</span>
                </button>

                <button
                  onClick={() => setActiveMediaModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Close Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

export default Gallery;

import React, { useState, useRef, useEffect } from 'react';
import { X, Star, Upload, Camera, CheckCircle2, Loader2, User, MapPin, Briefcase, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const SERVICES = [
  'House Painting',
  'Interior Painting',
  'Exterior Painting',
  'Texture Painting',
  'Wall Putty',
  'Waterproofing',
  'POP Design',
  'Wood Polish',
];

const LUCKNOW_AREAS = [
  'Gomti Nagar', 'Gomti Nagar Extension', 'Hazratganj', 'Indira Nagar',
  'Alambagh', 'Mahanagar', 'Jankipuram', 'Ashiyana', 'Aliganj',
  'Vikas Nagar', 'Rajajipuram', 'Chowk', 'Amausi', 'Chinhat',
];

const ReviewModal = ({ isOpen, onClose }) => {
  const { addTestimonial, convertFileToBase64 } = useCMS();

  const [form, setForm] = useState({
    name: '',
    location: '',
    service: '',
    rating: 0,
    comment: '',
    photo: null,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    if (isSubmitting) return;
    setForm({ name: '', location: '', service: '', rating: 0, comment: '', photo: null });
    setPhotoPreview(null);
    setErrors({});
    setSubmitted(false);
    setHoverRating(0);
    onClose();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'Photo must be under 3MB.' }));
      return;
    }
    setErrors(prev => ({ ...prev, photo: null }));
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setForm(prev => ({ ...prev, photo: file }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.location.trim()) newErrors.location = 'Location is required.';
    if (!form.service) newErrors.service = 'Please select a service.';
    if (!form.rating) newErrors.rating = 'Please give a star rating.';
    if (!form.comment.trim() || form.comment.trim().length < 20)
      newErrors.comment = 'Review must be at least 20 characters.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      let avatarData = null;
      if (form.photo) {
        avatarData = await convertFileToBase64(form.photo);
      }
      await addTestimonial({
        name: form.name.trim(),
        location: form.location.trim(),
        projectCategory: form.service,
        rating: form.rating,
        comment: form.comment.trim(),
        avatar: avatarData || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name.trim())}&background=d97706&color=fff&size=200`,
        date: 'Just now',
        isUserSubmitted: true,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Review submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const activeRating = hoverRating || form.rating;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
        style={{ animation: 'reviewModalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 rounded-t-3xl">
          <div>
            <h2 id="review-modal-title" className="text-xl font-extrabold text-slate-900 dark:text-white font-outfit">
              Write a Review
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Share your experience with Munnalal Painter</p>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {submitted ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-outfit mb-2">
              Thank you, {form.name.split(' ')[0]}! 🎉
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
              Your review has been published and will help other homeowners in Lucknow make better decisions. We truly appreciate your trust!
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors shadow-lg shadow-amber-500/30"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="review-name">
                <User className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="review-name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all
                  ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-amber-400 dark:focus:border-amber-500'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="review-location">
                <MapPin className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                Location / Area <span className="text-red-500">*</span>
              </label>
              <input
                id="review-location"
                type="text"
                list="lucknow-areas-list"
                placeholder="e.g. Gomti Nagar, Lucknow"
                value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all
                  ${errors.location ? 'border-red-400 focus:border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-amber-400 dark:focus:border-amber-500'}`}
              />
              <datalist id="lucknow-areas-list">
                {LUCKNOW_AREAS.map(a => <option key={a} value={`${a}, Lucknow`} />)}
              </datalist>
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>

            {/* Service Used */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="review-service">
                <Briefcase className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                Service Used <span className="text-red-500">*</span>
              </label>
              <select
                id="review-service"
                value={form.service}
                onChange={e => setForm(p => ({ ...p, service: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer
                  ${errors.service ? 'border-red-400 focus:border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-amber-400 dark:focus:border-amber-500'}`}
              >
                <option value="">-- Select a service --</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.service && <p className="text-xs text-red-500 mt-1">{errors.service}</p>}
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                <Star className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5" role="group" aria-label="Star rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    onClick={() => setForm(p => ({ ...p, rating: star }))}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= activeRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                {activeRating > 0 && (
                  <span className="ml-2 text-sm font-bold text-amber-600 dark:text-amber-400">
                    {ratingLabels[activeRating]}
                  </span>
                )}
              </div>
              {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating}</p>}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="review-comment">
                <MessageSquare className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                id="review-comment"
                rows={4}
                placeholder="Describe your experience in detail — quality of work, punctuality, cleanliness, etc."
                value={form.comment}
                onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all resize-none leading-relaxed
                  ${errors.comment ? 'border-red-400 focus:border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-amber-400 dark:focus:border-amber-500'}`}
              />
              <div className="flex justify-between mt-1">
                {errors.comment
                  ? <p className="text-xs text-red-500">{errors.comment}</p>
                  : <span />}
                <span className={`text-xs ml-auto ${form.comment.length < 20 ? 'text-slate-400' : 'text-emerald-500'}`}>
                  {form.comment.length} chars {form.comment.length < 20 ? `(min 20)` : '✓'}
                </span>
              </div>
            </div>

            {/* Photo Upload (optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <ImageIcon className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                Your Photo <span className="text-slate-400 font-normal normal-case">(optional)</span>
              </label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 shrink-0">
                  {photoPreview
                    ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    : <Camera className="w-6 h-6 text-slate-400" />
                  }
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-all bg-slate-50 dark:bg-slate-800"
                >
                  <Upload className="w-4 h-4" />
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  id="review-photo-input"
                />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">JPG, PNG, WebP — max 3MB</p>
              {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                id="review-submit-btn"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  : <><Star className="w-4 h-4 fill-white" /> Submit My Review</>
                }
              </button>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                Your review will be published instantly to our testimonials section.
              </p>
            </div>
          </form>
        )}
      </div>

      {/* Modal animation keyframe injected via style tag */}
      <style>{`
        @keyframes reviewModalIn {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ReviewModal;

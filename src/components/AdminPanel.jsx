import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShieldCheck, Lock, LogOut, Image as ImageIcon, Plus, Trash2, Edit3, Save, 
  CheckCircle, RefreshCw, LayoutDashboard, Sliders, Layers, Info, MessageSquare, 
  Phone, Users, Star, Upload, FileText, Check, AlertCircle, Eye, EyeOff, MapPin, Compass, Navigation, ExternalLink,
  Video, Camera, Film, Calendar
} from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const AdminPanel = ({ onBack }) => {
  const {
    isAuthenticated,
    needsSetup,
    login,
    logout,
    changePasscode,
    setupInitialPassword,
    getRateLimitStatus,
    validatePasswordStrength,
    convertFileToBase64,
    contactInfo,
    updateContactInfo,
    mapInfo,
    updateMapInfo,
    banner,
    updateBanner,
    aboutContent,
    updateAbout,
    services,
    addService,
    updateService,
    deleteService,
    gallery,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    testimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    estimates,
    deleteEstimate,
    contactLeads,
    deleteContactLead
  } = useCMS();

  // Login form state
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLocked, setLoginLocked] = useState(false);
  const [loginLockMs, setLoginLockMs] = useState(0);
  const [loginIsLoading, setLoginIsLoading] = useState(false);
  const lockCountdownRef = useRef(null);

  // Countdown timer for lockout
  useEffect(() => {
    if (!loginLocked || loginLockMs <= 0) return;
    lockCountdownRef.current = setInterval(() => {
      const status = getRateLimitStatus();
      if (!status.locked) {
        setLoginLocked(false);
        setLoginLockMs(0);
        setLoginError('');
        clearInterval(lockCountdownRef.current);
      } else {
        setLoginLockMs(status.msRemaining);
      }
    }, 1000);
    return () => clearInterval(lockCountdownRef.current);
  }, [loginLocked]);

  // Format ms remaining as mm:ss
  const formatCountdown = (ms) => {
    const totalSecs = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── First-time setup state ─────────────────────────────────────────────
  const [setupPass, setSetupPass] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [showSetupPass, setShowSetupPass] = useState(false);
  const [showSetupConfirm, setShowSetupConfirm] = useState(false);
  const [setupErrors, setSetupErrors] = useState([]);
  const [setupMessage, setSetupMessage] = useState('');
  const [setupIsLoading, setSetupIsLoading] = useState(false);

  // Compute strength for setup form password (reuses same scoring logic)
  const getSetupStrength = (p) => {
    if (!p) return { score: 0, label: '', color: '', textColor: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
    if (score === 1) return { score: 1, label: 'Weak',   color: 'bg-red-500',     textColor: 'text-red-400' };
    if (score === 2) return { score: 2, label: 'Medium', color: 'bg-amber-400',   textColor: 'text-amber-400' };
    if (score === 3) return { score: 3, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
    return { score: 0, label: '', color: '', textColor: '' };
  };
  const setupStrength = getSetupStrength(setupPass);

  const handleSetupPassChange = (val) => {
    setSetupPass(val);
    if (val.length > 0) {
      const { errors } = validatePasswordStrength(val);
      setSetupErrors(errors);
    } else {
      setSetupErrors([]);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (setupIsLoading) return;
    const { valid, errors } = validatePasswordStrength(setupPass);
    if (!valid) { setSetupErrors(errors); return; }
    if (setupPass !== setupConfirm) {
      setSetupMessage('Passwords do not match.');
      return;
    }
    setSetupIsLoading(true);
    setSetupMessage('');
    try {
      const res = await setupInitialPassword(setupPass);
      if (!res.success) {
        setSetupErrors(res.errors || []);
        setSetupMessage(res.error || 'Setup failed. Please try again.');
      }
      // On success: isAuthenticated flips to true via context → component re-renders to dashboard
    } finally {
      setSetupIsLoading(false);
    }
  };

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Async login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loginIsLoading || loginLocked) return;
    setLoginIsLoading(true);
    try {
      const result = await login(passcode);
      if (result.success) {
        setLoginError('');
        setPasscode('');
        setLoginLocked(false);
      } else if (result.locked) {
        setLoginError(result.error);
        setLoginLocked(true);
        setLoginLockMs(result.msRemaining || 0);
      } else {
        setLoginError(result.error || 'Incorrect password.');
      }
    } finally {
      setLoginIsLoading(false);
    }
  };

  // --- TAB 1: BANNER STATE ---
  const [bannerForm, setBannerForm] = useState(banner);
  const handleBannerSave = (e) => {
    e.preventDefault();
    updateBanner(bannerForm);
    showToast('Homepage Banner & Hero section updated successfully!');
  };
  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        setBannerForm(prev => ({ ...prev, bgImage: base64 }));
        showToast('Banner background image uploaded!');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- TAB 2: SERVICES STATE ---
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: 'Interior Painting',
    description: '',
    priceRange: '₹15 - ₹30 / sq.ft',
    features: '',
    image: '',
    iconName: 'Paintbrush'
  });

  const handleServiceFormSubmit = (e) => {
    e.preventDefault();
    const formattedFeatures = typeof serviceForm.features === 'string'
      ? serviceForm.features.split(',').map(f => f.trim()).filter(Boolean)
      : serviceForm.features;

    if (editingServiceId) {
      updateService(editingServiceId, { ...serviceForm, features: formattedFeatures });
      showToast('Service updated successfully!');
      setEditingServiceId(null);
    } else {
      addService({ ...serviceForm, features: formattedFeatures });
      showToast('New service added successfully!');
    }
    setServiceForm({
      title: '',
      category: 'Interior Painting',
      description: '',
      priceRange: '₹15 - ₹30 / sq.ft',
      features: '',
      image: '',
      iconName: 'Paintbrush'
    });
  };

  const handleEditServiceClick = (serv) => {
    setEditingServiceId(serv.id);
    setServiceForm({
      title: serv.title || '',
      category: serv.category || 'Interior Painting',
      description: serv.description || '',
      priceRange: serv.priceRange || '',
      features: Array.isArray(serv.features) ? serv.features.join(', ') : (serv.features || ''),
      image: serv.image || '',
      iconName: serv.iconName || 'Paintbrush'
    });
  };

  const handleServiceImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertFileToBase64(file);
      setServiceForm(prev => ({ ...prev, image: base64 }));
    }
  };

  // --- TAB 3: GALLERY / PROJECTS STATE (UNLIMITED PHOTOS & VIDEOS) ---
  const galleryCategories = [
    'Full House Painting',
    'Interior Painting',
    'Exterior Painting',
    'Texture Painting',
    'Wall Putty',
    'Waterproofing',
    'POP Design',
    'Wood Polish'
  ];

  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'Full House Painting',
    mediaType: 'photo', // 'photo' | 'video' | 'before_after'
    afterImage: '',
    beforeImage: '',
    videoUrl: '',
    location: 'Gomti Nagar, Lucknow',
    completionDate: 'July 2026',
    description: ''
  });

  const handleGalleryFormSubmit = (e) => {
    e.preventDefault();
    if (!galleryForm.title) {
      alert('Please provide a project title.');
      return;
    }
    if (editingGalleryId) {
      updateGalleryItem(editingGalleryId, galleryForm);
      showToast('Project updated successfully!');
      setEditingGalleryId(null);
    } else {
      addGalleryItem(galleryForm);
      showToast('New project uploaded! Displayed live on website immediately.');
    }
    setGalleryForm({
      title: '',
      category: 'Full House Painting',
      mediaType: 'photo',
      afterImage: '',
      beforeImage: '',
      videoUrl: '',
      location: 'Gomti Nagar, Lucknow',
      completionDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      description: ''
    });
  };

  const handleEditGalleryClick = (item) => {
    setEditingGalleryId(item.id);
    setGalleryForm({
      title: item.title || '',
      category: item.category || 'Full House Painting',
      mediaType: item.mediaType || (item.videoUrl ? 'video' : item.beforeImage ? 'before_after' : 'photo'),
      afterImage: item.afterImage || item.image || '',
      beforeImage: item.beforeImage || '',
      videoUrl: item.videoUrl || '',
      location: item.location || 'Lucknow',
      completionDate: item.completionDate || '',
      description: item.description || ''
    });
  };

  const handleGalleryAfterUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertFileToBase64(file);
      setGalleryForm(prev => ({ ...prev, afterImage: base64 }));
      showToast('Photo uploaded!');
    }
  };

  const handleGalleryBeforeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertFileToBase64(file);
      setGalleryForm(prev => ({ ...prev, beforeImage: base64 }));
      showToast('Before photo uploaded!');
    }
  };

  const handleGalleryVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertFileToBase64(file);
      setGalleryForm(prev => ({ ...prev, videoUrl: base64, mediaType: 'video' }));
      showToast('Video uploaded successfully!');
    }
  };

  // --- TAB 4: ABOUT US STATE ---
  const [aboutForm, setAboutForm] = useState(aboutContent);
  const handleAboutSave = (e) => {
    e.preventDefault();
    updateAbout(aboutForm);
    showToast('About Us content updated successfully!');
  };
  const handleAboutImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertFileToBase64(file);
      setAboutForm(prev => ({ ...prev, featureImage: base64 }));
    }
  };

  // --- TAB 5: TESTIMONIALS STATE ---
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    location: 'Gomti Nagar, Lucknow',
    rating: 5,
    projectCategory: 'Interior Painting',
    comment: '',
    avatar: ''
  });

  const handleTestimonialSubmit = (e) => {
    e.preventDefault();
    if (editingTestimonialId) {
      updateTestimonial(editingTestimonialId, testimonialForm);
      showToast('Testimonial updated!');
      setEditingTestimonialId(null);
    } else {
      addTestimonial(testimonialForm);
      showToast('New client review added!');
    }
    setTestimonialForm({
      name: '',
      location: 'Gomti Nagar, Lucknow',
      rating: 5,
      projectCategory: 'Interior Painting',
      comment: '',
      avatar: ''
    });
  };

  const handleEditTestimonialClick = (t) => {
    setEditingTestimonialId(t.id);
    setTestimonialForm({
      name: t.name || '',
      location: t.location || '',
      rating: t.rating || 5,
      projectCategory: t.projectCategory || 'Interior Painting',
      comment: t.comment || '',
      avatar: t.avatar || ''
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertFileToBase64(file);
      setTestimonialForm(prev => ({ ...prev, avatar: base64 }));
    }
  };

  // --- TAB 6: CONTACT & TIMINGS STATE ---
  const [contactForm, setContactForm] = useState(contactInfo);
  const handleContactInfoSave = (e) => {
    e.preventDefault();
    updateContactInfo(contactForm);
    showToast('Contact information & business timings updated!');
  };

  // --- TAB 7: MAP SETTINGS STATE ---
  const [mapForm, setMapForm] = useState(mapInfo || {
    address: contactInfo.address || 'Vibhuti Khand, Gomti Nagar, Lucknow - 226010',
    latitude: '26.8530',
    longitude: '81.0003',
    mapEmbedUrl: 'https://maps.google.com/maps?q=26.8530,81.0003&z=15&output=embed'
  });

  const handleMapSave = (e) => {
    e.preventDefault();
    let cleanUrl = mapForm.mapEmbedUrl.trim();
    if (cleanUrl.includes('<iframe')) {
      const match = cleanUrl.match(/src=["']([^"']+)["']/);
      if (match && match[1]) cleanUrl = match[1];
    }
    const finalMap = { ...mapForm, mapEmbedUrl: cleanUrl };
    updateMapInfo(finalMap);
    showToast('Google Map Settings & Location saved permanently!');
  };

  const generateEmbedFromLatLng = () => {
    const lat = mapForm.latitude.trim() || '26.8530';
    const lng = mapForm.longitude.trim() || '81.0003';
    const generated = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    setMapForm(prev => ({ ...prev, mapEmbedUrl: generated }));
    showToast('Generated Google Maps Embed URL from Lat & Lng!');
  };

  const getPreviewSrc = () => {
    let raw = mapForm.mapEmbedUrl ? mapForm.mapEmbedUrl.trim() : '';
    if (raw.includes('<iframe')) {
      const match = raw.match(/src=["']([^"']+)["']/);
      if (match && match[1]) return match[1];
    }
    if (raw.startsWith('http')) return raw;
    const lat = mapForm.latitude || '26.8530';
    const lng = mapForm.longitude || '81.0003';
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  };

  // --- TAB 8: SETTINGS STATE ---
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passMessage, setPassMessage] = useState('');
  const [passIsLoading, setPassIsLoading] = useState(false);
  const [passValidationErrors, setPassValidationErrors] = useState([]);

  // Compute password strength score (0-3)
  const getPasswordStrength = (p) => {
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score === 2) return { score: 2, label: 'Medium', color: 'bg-amber-400', textColor: 'text-amber-400' };
    if (score === 3) return { score: 3, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
    return { score: 0, label: '', color: '', textColor: '' };
  };

  const passwordStrength = getPasswordStrength(newPass);

  // Live validation as user types
  const handleNewPassChange = (val) => {
    setNewPass(val);
    if (val.length > 0) {
      const { errors } = validatePasswordStrength(val);
      setPassValidationErrors(errors);
    } else {
      setPassValidationErrors([]);
    }
  };

  const handleChangePassSubmit = async (e) => {
    e.preventDefault();
    if (passIsLoading) return;
    // Client-side validation first
    const { valid, errors } = validatePasswordStrength(newPass);
    if (!valid) {
      setPassValidationErrors(errors);
      setPassMessage('');
      return;
    }
    if (newPass !== confirmPass) {
      setPassMessage('Passwords do not match. Please re-enter.');
      return;
    }
    setPassIsLoading(true);
    try {
      const res = await changePasscode(newPass);
      if (res.success) {
        setPassMessage('✓ Admin password updated successfully! Please log in with your new password.');
        setNewPass('');
        setConfirmPass('');
        setPassValidationErrors([]);
        setTimeout(() => setPassMessage(''), 6000);
      } else {
        setPassValidationErrors(res.errors || []);
        setPassMessage(res.error || 'Failed to update password.');
      }
    } finally {
      setPassIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // UNAUTHENTICATED: LOGIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <section id="admin" className="py-24 bg-slate-900 text-white min-h-screen flex items-center justify-center relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-6 left-6 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 shadow-md transition-colors"
          >
            ← Back to Main Website
          </button>
        )}
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl space-y-6 text-center">

          {/* Icon + Title */}
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border ${needsSetup ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-brand-500/20 text-brand-400 border-brand-500/30'}`}>
            {needsSetup ? <ShieldCheck className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold font-outfit">
              {needsSetup ? 'Create Admin Password' : 'Munnalal Painter CMS'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {needsSetup
                ? 'First-time setup: create a strong password to secure your admin panel.'
                : 'Admin Portal Login for Content, Portfolio & Video Management'}
            </p>
          </div>

          {/* ── FIRST-TIME SETUP FORM ── */}
          {needsSetup ? (
            <form onSubmit={handleSetupSubmit} className="space-y-4 text-left">
              {/* Intro banner */}
              <div className="p-3 rounded-xl bg-amber-900/40 border border-amber-700/60 text-amber-200 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>No admin password has been set yet. Create one below to get started. You will be logged in automatically.</span>
              </div>

              {/* Error / message */}
              {setupMessage && (
                <div className="p-3 rounded-xl bg-red-900/60 border border-red-700 text-red-200 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{setupMessage}</span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-400">New Password</label>
                <div className="relative">
                  <input
                    type={showSetupPass ? 'text' : 'password'}
                    required
                    placeholder="min 8 chars, 1 uppercase, 1 number, 1 symbol"
                    value={setupPass}
                    onChange={e => handleSetupPassChange(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none pr-10"
                  />
                  <button type="button" onClick={() => setShowSetupPass(!showSetupPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showSetupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {setupPass.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3].map(step => (
                        <div key={step} className={`flex-1 rounded-full transition-all duration-300 ${setupStrength.score >= step ? setupStrength.color : 'bg-slate-700'}`} />
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-[11px] font-bold ${setupStrength.textColor || 'text-slate-500'}`}>
                        {setupStrength.label ? `Strength: ${setupStrength.label}` : 'Too short'}
                      </span>
                      <span className="text-[11px] text-slate-500">{setupPass.length} chars</span>
                    </div>
                  </div>
                )}

                {/* Per-criterion errors */}
                {setupErrors.length > 0 && (
                  <div className="space-y-1">
                    {setupErrors.map((err, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-red-400">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" /><span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}
                {setupErrors.length === 0 && setupPass.length >= 8 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <CheckCircle className="w-3 h-3 flex-shrink-0" /><span>All requirements met</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-400">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showSetupConfirm ? 'text' : 'password'}
                    required
                    placeholder="Re-enter the same password"
                    value={setupConfirm}
                    onChange={e => setSetupConfirm(e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl bg-slate-900 border text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none pr-10 ${setupConfirm.length > 0 && setupConfirm !== setupPass ? 'border-red-600' : 'border-slate-700'}`}
                  />
                  <button type="button" onClick={() => setShowSetupConfirm(!showSetupConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showSetupConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {setupConfirm.length > 0 && setupConfirm !== setupPass && (
                  <div className="flex items-center gap-1.5 text-[11px] text-red-400">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /><span>Passwords do not match</span>
                  </div>
                )}
                {setupConfirm.length > 0 && setupConfirm === setupPass && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <CheckCircle className="w-3 h-3 flex-shrink-0" /><span>Passwords match</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={setupIsLoading || setupErrors.length > 0 || (setupConfirm.length > 0 && setupConfirm !== setupPass)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 font-bold text-sm text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {setupIsLoading
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating Password…</>
                  : <><ShieldCheck className="w-4 h-4" /> Create Password & Enter Dashboard</>
                }
              </button>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-[10px] text-slate-500 text-center space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-400 font-semibold">Secured with PBKDF2-SHA256 hashing</span>
                </div>
                <div>Password never stored in plain text</div>
              </div>
            </form>
          ) : (
            /* ── STANDARD LOGIN FORM ── */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              {/* Lockout Banner */}
              {loginLocked && (
                <div className="p-4 rounded-xl bg-red-900/70 border border-red-600 text-red-200 text-xs font-semibold space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="font-bold text-red-300">Account Locked</span>
                  </div>
                  <p>Too many failed attempts. Try again in:</p>
                  <div className="text-3xl font-bold text-red-300 tracking-widest text-center py-1">
                    {formatCountdown(loginLockMs)}
                  </div>
                  <p className="text-[10px] text-red-400 text-center">Rate limit: 5 attempts / 15-minute lockout</p>
                </div>
              )}

              {/* Error message (non-lockout) */}
              {loginError && !loginLocked && (
                <div className="p-3.5 rounded-xl bg-red-900/60 border border-red-700 text-red-200 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPasscode ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={passcode}
                    onChange={e => setPasscode(e.target.value)}
                    disabled={loginLocked || loginIsLoading}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLocked || loginIsLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 font-bold text-sm text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loginIsLoading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying…</>
                ) : loginLocked ? (
                  <><Lock className="w-4 h-4" /> Locked — Wait {formatCountdown(loginLockMs)}</>
                ) : (
                  'Unlock Admin Dashboard'
                )}
              </button>

              {/* Security note */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-[10px] text-slate-500 text-center space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-400 font-semibold">Secured with PBKDF2-SHA256 hashing</span>
                </div>
                <div>Rate limit: 5 failed attempts triggers 15-min lockout</div>
              </div>
            </form>
          )}
        </div>
      </section>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED: ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <section id="admin" className="py-16 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-8 right-8 z-50 px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5" />
              <span>Munnalal Painter Content Management System</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-outfit mt-1">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold transition-all"
              >
                ← Back to Website
              </button>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 text-xs font-bold transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Admin</span>
            </button>
          </div>
        </div>

        {/* Sidebar / Tabs Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          <div className="lg:col-span-3">
            <div className="sticky top-28 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  activeTab === 'gallery'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Portfolio & Videos (8 Categories)</span>
              </button>

              <button
                onClick={() => setActiveTab('banner')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  activeTab === 'banner'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Banner & Hero Image</span>
              </button>

              <button
                onClick={() => setActiveTab('services')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  activeTab === 'services'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Manage Services</span>
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  activeTab === 'map'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Map Settings (Embed & Coords)</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  activeTab === 'about'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>Edit About Us Content</span>
              </button>

              <button
                onClick={() => setActiveTab('testimonials')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  activeTab === 'testimonials'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Testimonials & Reviews</span>
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  activeTab === 'contact'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Contact Info & Timings</span>
              </button>

              <button
                onClick={() => setActiveTab('leads')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  activeTab === 'leads'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Customer Leads ({estimates.length + contactLeads.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Admin Passcode Settings</span>
              </button>
            </div>
          </div>

          {/* Main Tab Content View */}
          <div className="lg:col-span-9">

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-xs font-bold uppercase text-slate-400">Total Gallery Items</div>
                    <div className="text-3xl font-black text-brand-500 font-outfit mt-1">{gallery.length}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Photos & Videos Across 8 Categories</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-xs font-bold uppercase text-slate-400">Active Services</div>
                    <div className="text-3xl font-black text-amber-500 font-outfit mt-1">{services.length}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Live on Website</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-xs font-bold uppercase text-slate-400">Customer Testimonials</div>
                    <div className="text-3xl font-black text-emerald-500 font-outfit mt-1">{testimonials.length}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Verified Client Reviews</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-xs font-bold uppercase text-slate-400">Total Customer Leads</div>
                    <div className="text-3xl font-black text-indigo-500 font-outfit mt-1">{estimates.length + contactLeads.length}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Inquiries & Estimates</div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick CMS Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button onClick={() => setActiveTab('gallery')} className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-bold text-xs hover:bg-brand-100 transition-colors text-left flex items-center gap-2">
                      <Camera className="w-4 h-4 text-brand-500" />
                      <span>+ Upload Photos & Videos</span>
                    </button>
                    <button onClick={() => setActiveTab('map')} className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors text-left flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span>🗺️ Update Google Map & Coords</span>
                    </button>
                    <button onClick={() => setActiveTab('contact')} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition-colors text-left">
                      📞 Update Phone & Business Hours
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PORTFOLIO & VIDEOS MANAGER (8 CATEGORIES) */}
            {activeTab === 'gallery' && (
              <div className="space-y-8">
                <form onSubmit={handleGalleryFormSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {editingGalleryId ? 'Edit Project / Media' : 'Upload Photos or Videos to Portfolio'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Supports 8 categories: Full House Painting, Interior Painting, Exterior Painting, Texture Painting, Wall Putty, Waterproofing, POP Design, Wood Polish.
                      </p>
                    </div>
                    {editingGalleryId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGalleryId(null);
                          setGalleryForm({ title: '', category: 'Full House Painting', mediaType: 'photo', afterImage: '', beforeImage: '', videoUrl: '', location: 'Gomti Nagar, Lucknow', completionDate: 'July 2026', description: '' });
                        }}
                        className="text-xs text-slate-500 hover:text-white"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  {/* Media Type Selector Pills */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Media Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setGalleryForm({ ...galleryForm, mediaType: 'photo' })}
                        className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                          galleryForm.mediaType === 'photo'
                            ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        <span>Single Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGalleryForm({ ...galleryForm, mediaType: 'video' })}
                        className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                          galleryForm.mediaType === 'video'
                            ? 'bg-red-600 text-white border-red-600 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>Video Project</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGalleryForm({ ...galleryForm, mediaType: 'before_after' })}
                        className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                          galleryForm.mediaType === 'before_after'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Film className="w-4 h-4" />
                        <span>Before & After Slider</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Project Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gomti Nagar 4BHK Villa Full House Painting"
                        value={galleryForm.title}
                        onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Gallery Section *</label>
                      <select
                        value={galleryForm.category}
                        onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none font-bold text-brand-600 dark:text-brand-400"
                      >
                        {galleryCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location in Lucknow</label>
                      <input
                        type="text"
                        placeholder="e.g. Gomti Nagar Extension, Lucknow"
                        value={galleryForm.location}
                        onChange={e => setGalleryForm({ ...galleryForm, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Completion Date</label>
                      <input
                        type="text"
                        placeholder="e.g. July 2026"
                        value={galleryForm.completionDate}
                        onChange={e => setGalleryForm({ ...galleryForm, completionDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Project Description</label>
                    <textarea
                      rows="2"
                      placeholder="Specify materials used (e.g. Asian Paints Royale Matte), dust-free sanding, or custom texture design details..."
                      value={galleryForm.description}
                      onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>

                  {/* Dynamic Inputs based on selected Media Type */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
                    
                    {galleryForm.mediaType === 'video' ? (
                      /* Video Upload / URL Input */
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Video File / Direct Video URL *
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Enter video MP4 URL or paste link..."
                            value={galleryForm.videoUrl}
                            onChange={e => setGalleryForm({ ...galleryForm, videoUrl: e.target.value })}
                            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                          />
                          <label className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-md">
                            <Upload className="w-4 h-4" />
                            <span>Upload Video</span>
                            <input type="file" accept="video/*" onChange={handleGalleryVideoUpload} className="hidden" />
                          </label>
                        </div>
                        {galleryForm.videoUrl && (
                          <div className="mt-2 h-44 rounded-xl overflow-hidden bg-black border border-slate-700">
                            <video src={galleryForm.videoUrl} controls className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                    ) : galleryForm.mediaType === 'before_after' ? (
                      /* Before & After Photo Inputs */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">AFTER Photo (Main Photo) *</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Photo URL or Upload"
                              value={galleryForm.afterImage}
                              onChange={e => setGalleryForm({ ...galleryForm, afterImage: e.target.value })}
                              className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                            />
                            <label className="px-3 py-2 rounded-lg bg-brand-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                              <input type="file" accept="image/*" onChange={handleGalleryAfterUpload} className="hidden" />
                            </label>
                          </div>
                          {galleryForm.afterImage && (
                            <div className="h-32 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                              <img src={galleryForm.afterImage} alt="After Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">BEFORE Photo *</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Before Photo URL or Upload"
                              value={galleryForm.beforeImage}
                              onChange={e => setGalleryForm({ ...galleryForm, beforeImage: e.target.value })}
                              className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                            />
                            <label className="px-3 py-2 rounded-lg bg-slate-800 text-white font-bold text-xs cursor-pointer flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                              <input type="file" accept="image/*" onChange={handleGalleryBeforeUpload} className="hidden" />
                            </label>
                          </div>
                          {galleryForm.beforeImage && (
                            <div className="h-32 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                              <img src={galleryForm.beforeImage} alt="Before Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Single Photo Input */
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Project Cover Photo (Upload Unlimited Photos) *
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Enter Photo URL or click upload..."
                            value={galleryForm.afterImage}
                            onChange={e => setGalleryForm({ ...galleryForm, afterImage: e.target.value })}
                            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs outline-none"
                          />
                          <label className="px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-md">
                            <Upload className="w-4 h-4" />
                            <span>Upload Photo</span>
                            <input type="file" accept="image/*" onChange={handleGalleryAfterUpload} className="hidden" />
                          </label>
                        </div>
                        {galleryForm.afterImage && (
                          <div className="mt-2 h-44 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                            <img src={galleryForm.afterImage} alt="Photo Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingGalleryId ? 'Update Media Item' : 'Save & Publish Item Live'}</span>
                  </button>
                </form>

                {/* Existing Projects List */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Uploaded Projects & Media ({gallery.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map(item => (
                      <div key={item.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="h-36 rounded-xl overflow-hidden relative bg-black">
                          {item.mediaType === 'video' || item.videoUrl ? (
                            <video src={item.videoUrl} poster={item.afterImage} className="w-full h-full object-cover" />
                          ) : (
                            <img src={item.afterImage || item.image} alt={item.title} className="w-full h-full object-cover" />
                          )}
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-bold uppercase">
                            {item.category}
                          </span>
                          {(item.mediaType === 'video' || item.videoUrl) && (
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">
                              VIDEO
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{item.title}</h5>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] text-slate-500">{item.location}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditGalleryClick(item)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { deleteGalleryItem(item.id); showToast('Project deleted!'); }}
                              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BANNER MANAGER */}
            {activeTab === 'banner' && (
              <form onSubmit={handleBannerSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Homepage Hero Banner Settings</h3>
                  <p className="text-xs text-slate-500 mt-1">Change background image, title, subtext, and badges instantly.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hero Background Image (Upload File or Enter Image URL)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={bannerForm.bgImage || ''}
                        onChange={e => setBannerForm({ ...bannerForm, bgImage: e.target.value })}
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                      />
                      <label className="px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo</span>
                        <input type="file" accept="image/*" onChange={handleBannerImageUpload} className="hidden" />
                      </label>
                    </div>
                    {bannerForm.bgImage && (
                      <div className="mt-3 h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img src={bannerForm.bgImage} alt="Banner Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Top Badge Text</label>
                    <input
                      type="text"
                      value={bannerForm.badgeText || ''}
                      onChange={e => setBannerForm({ ...bannerForm, badgeText: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Main Heading</label>
                    <input
                      type="text"
                      value={bannerForm.title || ''}
                      onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subheading Description</label>
                    <textarea
                      rows="3"
                      value={bannerForm.subtitle || ''}
                      onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Banner Changes</span>
                </button>
              </form>
            )}

            {/* TAB: MAP SETTINGS */}
            {activeTab === 'map' && (
              <form onSubmit={handleMapSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>Google Maps & Location Management</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Map Settings</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update Google Maps Embed URL, Latitude, Longitude, and Business Address. Preview updates live before saving.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Business Office Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vibhuti Khand, Gomti Nagar, Lucknow - 226010"
                      value={mapForm.address}
                      onChange={e => setMapForm({ ...mapForm, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Latitude (e.g. 26.8530) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="26.8530"
                        value={mapForm.latitude}
                        onChange={e => setMapForm({ ...mapForm, latitude: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Longitude (e.g. 81.0003) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="81.0003"
                        value={mapForm.longitude}
                        onChange={e => setMapForm({ ...mapForm, longitude: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Google Maps Embed URL / iFrame Code *
                      </label>
                      <button
                        type="button"
                        onClick={generateEmbedFromLatLng}
                        className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Auto-Generate from Lat/Lng</span>
                      </button>
                    </div>
                    <textarea
                      rows="3"
                      required
                      placeholder="Paste Google Maps embed URL (https://maps.google.com/maps?q=...) or full <iframe> code..."
                      value={mapForm.mapEmbedUrl}
                      onChange={e => setMapForm({ ...mapForm, mapEmbedUrl: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Live Interactive Map Preview Container */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <Eye className="w-4 h-4" />
                      <span>Live Admin Map Preview (Before Saving)</span>
                    </span>
                    <span className="text-slate-400 text-[11px]">Updates in real-time</span>
                  </div>

                  <div className="w-full h-64 rounded-xl overflow-hidden shadow-inner border border-slate-300 dark:border-slate-700 bg-white">
                    <iframe
                      title="Live Map Preview"
                      src={getPreviewSrc()}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Map Settings Permanently</span>
                </button>
              </form>
            )}

            {/* TAB: SERVICES MANAGER */}
            {activeTab === 'services' && (
              <div className="space-y-8">
                <form onSubmit={handleServiceFormSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {editingServiceId ? 'Edit Service' : 'Add New Service'}
                    </h3>
                    {editingServiceId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingServiceId(null);
                          setServiceForm({ title: '', category: 'Interior Painting', description: '', priceRange: '₹15 - ₹30 / sq.ft', features: '', image: '', iconName: 'Paintbrush' });
                        }}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Service Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Wood Polish"
                        value={serviceForm.title}
                        onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                      <select
                        value={serviceForm.category}
                        onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                      >
                        <option value="Interior Painting">Interior Painting</option>
                        <option value="Exterior Painting">Exterior Painting</option>
                        <option value="POP Design">POP Design</option>
                        <option value="Texture Painting">Texture Painting</option>
                        <option value="Waterproofing">Waterproofing</option>
                        <option value="Wood Polish">Wood Polish</option>
                        <option value="Wall Putty">Wall Putty</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Price Range</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹20 - ₹40 / sq.ft"
                        value={serviceForm.priceRange}
                        onChange={e => setServiceForm({ ...serviceForm, priceRange: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Service Cover Image</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Image URL or upload"
                          value={serviceForm.image}
                          onChange={e => setServiceForm({ ...serviceForm, image: e.target.value })}
                          className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                        />
                        <label className="px-3 py-3 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer">
                          Upload
                          <input type="file" accept="image/*" onChange={handleServiceImageUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Features (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Dust-free sanding, 2 Coats Emulsion, Color Consultation"
                      value={serviceForm.features}
                      onChange={e => setServiceForm({ ...serviceForm, features: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea
                      rows="3"
                      value={serviceForm.description}
                      onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingServiceId ? 'Update Service' : 'Add Service'}</span>
                  </button>
                </form>

                {/* Existing Services List */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Existing Services ({services.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(serv => (
                      <div key={serv.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-brand-500 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded">
                            {serv.category}
                          </span>
                          <h5 className="font-bold text-slate-900 dark:text-white text-base">{serv.title}</h5>
                          <p className="text-xs text-slate-500">{serv.priceRange}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditServiceClick(serv)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { deleteService(serv.id); showToast('Service deleted!'); }}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ABOUT US EDITOR */}
            {activeTab === 'about' && (
              <form onSubmit={handleAboutSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">About Us Section Content</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Edit company biography, story, and feature images.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Headline</label>
                    <input
                      type="text"
                      value={aboutForm.headline || ''}
                      onChange={e => setAboutForm({ ...aboutForm, headline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subheading</label>
                    <textarea
                      rows="2"
                      value={aboutForm.subheading || ''}
                      onChange={e => setAboutForm({ ...aboutForm, subheading: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Story Title</label>
                    <input
                      type="text"
                      value={aboutForm.storyTitle || ''}
                      onChange={e => setAboutForm({ ...aboutForm, storyTitle: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Main Description Paragraph 1</label>
                    <textarea
                      rows="3"
                      value={aboutForm.paragraph1 || ''}
                      onChange={e => setAboutForm({ ...aboutForm, paragraph1: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Feature Photo URL / Upload</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aboutForm.featureImage || ''}
                        onChange={e => setAboutForm({ ...aboutForm, featureImage: e.target.value })}
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                      />
                      <label className="px-4 py-3 rounded-xl bg-brand-500 text-white font-bold text-xs cursor-pointer">
                        Upload
                        <input type="file" accept="image/*" onChange={handleAboutImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save About Us Changes</span>
                </button>
              </form>
            )}

            {/* TAB: TESTIMONIALS MANAGER */}
            {activeTab === 'testimonials' && (
              <div className="space-y-8">
                <form onSubmit={handleTestimonialSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {editingTestimonialId ? 'Edit Review' : 'Add Customer Testimonial'}
                    </h3>
                    {editingTestimonialId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTestimonialId(null);
                          setTestimonialForm({ name: '', location: 'Gomti Nagar, Lucknow', rating: 5, projectCategory: 'Interior Painting', comment: '', avatar: '' });
                        }}
                        className="text-xs text-slate-500"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Sharma"
                        value={testimonialForm.name}
                        onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location / Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Gomti Nagar, Lucknow"
                        value={testimonialForm.location}
                        onChange={e => setTestimonialForm({ ...testimonialForm, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rating (1 to 5 Stars)</label>
                      <select
                        value={testimonialForm.rating}
                        onChange={e => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                        <option value={3}>⭐⭐⭐ (3 Stars)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Project Category</label>
                      <select
                        value={testimonialForm.projectCategory}
                        onChange={e => setTestimonialForm({ ...testimonialForm, projectCategory: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                      >
                        {galleryCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Client Avatar / Photo</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Photo URL or upload"
                          value={testimonialForm.avatar}
                          onChange={e => setTestimonialForm({ ...testimonialForm, avatar: e.target.value })}
                          className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                        />
                        <label className="px-3 py-3 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer">
                          Upload
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Review Comment *</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Write customer feedback..."
                      value={testimonialForm.comment}
                      onChange={e => setTestimonialForm({ ...testimonialForm, comment: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingTestimonialId ? 'Update Review' : 'Add Testimonial'}</span>
                  </button>
                </form>

                {/* Existing Testimonials List */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Active Customer Reviews ({testimonials.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testimonials.map(t => (
                      <div key={t.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={t.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <h5 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h5>
                              <p className="text-[10px] text-slate-500">{t.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEditTestimonialClick(t)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => { deleteTestimonial(t.id); showToast('Review deleted!'); }} className="p-1.5 rounded-lg bg-red-100 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{t.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONTACT & BUSINESS TIMINGS */}
            {activeTab === 'contact' && (
              <form onSubmit={handleContactInfoSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Contact Info & Business Hours</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Updates are immediately reflected across header, footer, floating buttons & contact page.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Call Helpline *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.phone || ''}
                      onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Chat Number *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.whatsapp || ''}
                      onChange={e => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none font-bold text-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={contactForm.email || ''}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Business Timings *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.timings || ''}
                      onChange={e => setContactForm({ ...contactForm, timings: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none font-bold text-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lucknow Office Address</label>
                  <input
                    type="text"
                    value={contactForm.address || ''}
                    onChange={e => setContactForm({ ...contactForm, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Contact & Business Hours</span>
                </button>
              </form>
            )}

            {/* TAB: LEADS */}
            {activeTab === 'leads' && (
              <div className="space-y-8">
                {/* Contact Submissions */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Direct Contact Inquiries ({contactLeads.length})</h3>
                  {contactLeads.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4">No contact messages received yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {contactLeads.map(lead => (
                        <div key={lead.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{lead.name}</span>
                              <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-700 text-[10px] font-bold">{lead.service}</span>
                            </div>
                            <div className="text-xs text-slate-500">Phone: <strong>{lead.phone}</strong> | Email: {lead.email || 'N/A'}</div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 italic">"{lead.message}"</p>
                          </div>
                          <button
                            onClick={() => { deleteContactLead(lead.id); showToast('Inquiry deleted.'); }}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white self-end sm:self-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Estimate Submissions */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Price Estimate Submissions ({estimates.length})</h3>
                  {estimates.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4">No price estimate submissions received yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {estimates.map(est => (
                        <div key={est.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{est.name} - {est.workType}</div>
                            <div className="text-xs text-slate-500">Mobile: {est.mobile} | Area: {est.squareFeet} sq.ft</div>
                            <div className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-1">Est: ₹{est.estimatedCostMin} - ₹{est.estimatedCostMax}</div>
                          </div>
                          <button
                            onClick={() => { deleteEstimate(est.id); showToast('Estimate deleted.'); }}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white self-end sm:self-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Change Password Form */}
                <form onSubmit={handleChangePassSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Admin Security Settings</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Set a strong password to protect this Admin Panel. Passwords are hashed with PBKDF2-SHA256 and never stored in plain text.</p>
                  </div>

                  {/* Status message */}
                  {passMessage && (
                    <div className={`p-3.5 rounded-xl border text-xs font-bold ${passMessage.startsWith('✓') ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
                      {passMessage}
                    </div>
                  )}

                  {/* New Password field */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">New Admin Password</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        required
                        placeholder="Enter strong admin password (min 8 chars, 1 uppercase, 1 number, 1 symbol)"
                        value={newPass}
                        onChange={e => handleNewPassChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Strength Bar */}
                    {newPass.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex gap-1 h-1.5">
                          {[1, 2, 3].map((step) => (
                            <div
                              key={step}
                              className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= step ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-bold ${passwordStrength.textColor || 'text-slate-400'}`}>
                            {passwordStrength.label ? `Password Strength: ${passwordStrength.label}` : 'Too short'}
                          </span>
                          <span className="text-[11px] text-slate-400">{newPass.length} chars</span>
                        </div>
                      </div>
                    )}

                    {/* Per-criterion validation errors */}
                    {passValidationErrors.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {passValidationErrors.map((err, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* All-pass indicator */}
                    {passValidationErrors.length === 0 && newPass.length >= 8 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 pt-1">
                        <CheckCircle className="w-3 h-3 flex-shrink-0" />
                        <span>All password requirements met</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password field */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        required
                        placeholder="Re-enter the same password"
                        value={confirmPass}
                        onChange={e => setConfirmPass(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500 pr-10 ${confirmPass.length > 0 && confirmPass !== newPass ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPass.length > 0 && confirmPass !== newPass && (
                      <div className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>Passwords do not match</span>
                      </div>
                    )}
                    {confirmPass.length > 0 && confirmPass === newPass && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3 h-3 flex-shrink-0" />
                        <span>Passwords match</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={passIsLoading || passValidationErrors.length > 0 || (confirmPass.length > 0 && confirmPass !== newPass)}
                    className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {passIsLoading ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Hashing & Saving…</>
                    ) : (
                      <><Lock className="w-4 h-4" /><span>Update Admin Password</span></>
                    )}
                  </button>
                </form>

                {/* Security Info Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Security Information</h3>
                      <p className="text-[11px] text-slate-500">Current security configuration for this admin panel</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Password Hashing', value: 'PBKDF2-SHA256', sub: '100,000 iterations + random salt' },
                      { label: 'Storage', value: 'LocalStorage (hash only)', sub: 'Plain-text passwords never stored' },
                      { label: 'Rate Limiting', value: '5 attempts max', sub: '15-minute lockout on exceed' },
                      { label: 'Minimum Password', value: '8+ characters', sub: 'Uppercase, number & symbol required' },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{value}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};

export default AdminPanel;

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, MessageCircle, Phone, Calculator, ArrowRight, 
  Gift, CheckCircle2, Calendar, Star, Flame
} from 'lucide-react';
import { useCMS } from '../context/cmsContext';
import { normalizeMediaUrl } from '../utils/mediaUtils';

// Theme Configurations for Festivals
const THEME_CONFIGS = {
  diwali: {
    name: 'Diwali Special',
    badge: '🪔 Shubh Deepawali Offer',
    gradientBg: 'from-amber-600 via-orange-600 to-amber-700',
    cardBorder: 'border-amber-400/40',
    glowColor: 'shadow-amber-500/20',
    badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
    ctaGradient: 'from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white',
    accentText: 'text-amber-300',
    icon: Flame,
    defaultBanner: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=800'
  },
  holi: {
    name: 'Holi Dhamaka',
    badge: '🎨 Rang Barse Special',
    gradientBg: 'from-fuchsia-600 via-pink-600 to-violet-700',
    cardBorder: 'border-pink-400/40',
    glowColor: 'shadow-pink-500/20',
    badgeBg: 'bg-pink-500/20 text-pink-200 border-pink-400/30',
    ctaGradient: 'from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-600 hover:to-fuchsia-600 text-white',
    accentText: 'text-pink-300',
    icon: Sparkles,
    defaultBanner: 'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?auto=format&fit=crop&q=80&w=800'
  },
  navratri: {
    name: 'Navratri Utsav',
    badge: '🌸 Shubh Navratri Special',
    gradientBg: 'from-orange-600 via-rose-600 to-amber-700',
    cardBorder: 'border-orange-400/40',
    glowColor: 'shadow-orange-500/20',
    badgeBg: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
    ctaGradient: 'from-orange-500 via-rose-500 to-red-600 hover:from-orange-600 hover:to-rose-600 text-white',
    accentText: 'text-orange-300',
    icon: Star,
    defaultBanner: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800'
  },
  eid: {
    name: 'Eid Mubarak',
    badge: '🌙 Eid Mubarak Special',
    gradientBg: 'from-emerald-700 via-teal-700 to-emerald-900',
    cardBorder: 'border-emerald-400/40',
    glowColor: 'shadow-emerald-500/20',
    badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    ctaGradient: 'from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white',
    accentText: 'text-emerald-300',
    icon: Sparkles,
    defaultBanner: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
  },
  christmas: {
    name: 'Christmas & New Year',
    badge: '🎄 Festive Year-End Offer',
    gradientBg: 'from-red-700 via-rose-700 to-red-900',
    cardBorder: 'border-red-400/40',
    glowColor: 'shadow-red-500/20',
    badgeBg: 'bg-red-500/20 text-red-200 border-red-400/30',
    ctaGradient: 'from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white',
    accentText: 'text-rose-300',
    icon: Gift,
    defaultBanner: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'
  },
  custom: {
    name: 'Festive Offer',
    badge: '✨ Exclusive Festive Offer',
    gradientBg: 'from-brand-600 via-amber-600 to-brand-700',
    cardBorder: 'border-brand-400/40',
    glowColor: 'shadow-brand-500/20',
    badgeBg: 'bg-brand-500/20 text-brand-200 border-brand-400/30',
    ctaGradient: 'from-brand-500 via-amber-500 to-brand-600 hover:from-brand-600 hover:to-amber-600 text-white',
    accentText: 'text-brand-300',
    icon: Sparkles,
    defaultBanner: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800'
  }
};

const FestivalPopup = ({ previewOffer = null, isPreview = false, onClose = null }) => {
  const { activeFestivalOffer, contactInfo, fetchActiveFestivalOffer } = useCMS();
  const [offer, setOffer] = useState(previewOffer || activeFestivalOffer);
  const [isVisible, setIsVisible] = useState(false);
  const closeButtonRef = useRef(null);

  // If previewOffer changes in admin preview, update state immediately
  useEffect(() => {
    if (previewOffer) {
      setOffer(previewOffer);
      setIsVisible(true);
      return;
    }
  }, [previewOffer]);

  // Public visitor mode: fetch from backend and check cooldown
  useEffect(() => {
    if (isPreview || previewOffer) return;

    let isMounted = true;

    const checkAndDisplayOffer = async () => {
      let targetOffer = activeFestivalOffer;
      if (!targetOffer) {
        targetOffer = await fetchActiveFestivalOffer();
      }

      if (!isMounted || !targetOffer) return;

      // Cooldown check for regular visitors
      try {
        const storageKey = `munnalal_festival_dismissed_${targetOffer.id}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const record = JSON.parse(stored);
          if (record && record.expiresAt && Date.now() < record.expiresAt) {
            // Visitor is within cooldown period — keep popup hidden
            return;
          }
        }
      } catch (e) {
        // Fallback if localStorage blocked
      }

      setOffer(targetOffer);
      // Subtle delay so popup doesn't block initial paint
      const timer = setTimeout(() => {
        if (isMounted) setIsVisible(true);
      }, 1200);

      return () => clearTimeout(timer);
    };

    checkAndDisplayOffer();

    return () => {
      isMounted = false;
    };
  }, [isPreview, previewOffer, activeFestivalOffer]);

  // Handle keyboard events (Escape to close) & focus management
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);

    // Save cooldown for regular visitor
    if (!isPreview && offer && offer.id) {
      try {
        const cooldownHours = offer.cooldownHours !== undefined ? Number(offer.cooldownHours) : 24;
        const expiresAt = Date.now() + (cooldownHours * 60 * 60 * 1000);
        localStorage.setItem(`munnalal_festival_dismissed_${offer.id}`, JSON.stringify({
          offerId: offer.id,
          dismissedAt: Date.now(),
          expiresAt
        }));
      } catch (e) {
        // Ignore localStorage error
      }
    }

    if (onClose) onClose();
  };

  if (!isVisible || !offer) {
    return null;
  }

  const themeKey = (offer.theme || 'custom').toLowerCase();
  const theme = THEME_CONFIGS[themeKey] || THEME_CONFIGS.custom;
  const ThemeIcon = theme.icon;

  const cleanPhone = (p) => p ? p.replace(/[^0-9+]/g, '') : '';
  const officialPhone = contactInfo?.phone || '+91 76684 15684';
  const officialWhatsapp = contactInfo?.whatsapp || contactInfo?.phone || '+91 83037 19864';

  // Construct CTA action and destination
  const getCtaProps = () => {
    const type = offer.ctaType || 'whatsapp';
    const ctaText = offer.ctaText || 'Claim Offer on WhatsApp';

    if (type === 'whatsapp') {
      const defaultMsg = `Hello Munnalal Painter, I saw your ${offer.festivalName || 'Festive'} Offer ("${offer.heading}") on your website. I want to book painting services in Lucknow.`;
      const waNumber = cleanPhone(officialWhatsapp);
      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(defaultMsg)}`;
      return {
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
        icon: MessageCircle,
        label: ctaText
      };
    }

    if (type === 'call') {
      return {
        href: `tel:${cleanPhone(officialPhone)}`,
        icon: Phone,
        label: ctaText
      };
    }

    if (type === 'estimate') {
      return {
        href: '#pricing',
        onClick: () => {
          handleClose();
          const el = document.getElementById('pricing');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        },
        icon: Calculator,
        label: ctaText
      };
    }

    // Default: Custom Link or WhatsApp fallback
    return {
      href: offer.ctaDestination || '#contact',
      target: offer.ctaDestination?.startsWith('http') ? '_blank' : '_self',
      rel: 'noopener noreferrer',
      icon: ArrowRight,
      label: ctaText
    };
  };

  const cta = getCtaProps();
  const CtaIcon = cta.icon;

  // Format offer details as list
  const detailsList = Array.isArray(offer.offerDetails)
    ? offer.offerDetails.filter(Boolean)
    : (offer.offerDetails ? String(offer.offerDetails).split('\n').filter(Boolean) : []);

  const bannerImg = offer.bannerImage ? normalizeMediaUrl(offer.bannerImage) : theme.defaultBanner;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="festival-popup-title"
      aria-describedby="festival-popup-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={`relative w-full max-w-lg rounded-3xl bg-slate-900 border ${theme.cardBorder} shadow-2xl ${theme.glowColor} overflow-hidden transform transition-all duration-300 text-white my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Festive Strip */}
        <div className={`px-6 py-2.5 bg-gradient-to-r ${theme.gradientBg} flex items-center justify-between text-xs font-bold tracking-wide uppercase shadow-inner`}>
          <div className="flex items-center gap-1.5">
            <ThemeIcon className="w-4 h-4 animate-pulse" />
            <span>{offer.festivalName || theme.name}</span>
          </div>
          <span className="text-[10px] opacity-90 tracking-wider">Limited Period Offer</span>
        </div>

        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          className="absolute top-10 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-white/20 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          aria-label="Close festival offer popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner Image */}
        {bannerImg && (
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-950">
            <img 
              src={bannerImg} 
              alt={offer.festivalName || 'Festival Offer'} 
              className="w-full h-full object-cover object-center filter brightness-95"
              loading="lazy"
              onError={(e) => {
                if (theme?.defaultBanner && e.currentTarget.src !== theme.defaultBanner) {
                  e.currentTarget.src = theme.defaultBanner;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            
            {/* Festival Badge overlay */}
            <div className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-sm bg-slate-950/80 text-amber-300 border-amber-400/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{theme.badge}</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4">
          
          {/* Heading */}
          <div>
            <h2 
              id="festival-popup-title"
              className="text-xl sm:text-2xl font-black tracking-tight font-outfit text-white leading-snug"
            >
              {offer.heading}
            </h2>
            
            {/* Description / Subheading */}
            {offer.description && (
              <p 
                id="festival-popup-desc"
                className="text-sm text-slate-300 mt-2 font-normal leading-relaxed"
              >
                {offer.description}
              </p>
            )}
          </div>

          {/* Offer Details / Highlights */}
          {detailsList.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-brand-400" />
                <span>Offer Inclusions &amp; Benefits:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {detailsList.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-tight">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Button */}
          <div className="pt-2">
            <a
              href={cta.href}
              target={cta.target}
              rel={cta.rel}
              onClick={cta.onClick}
              className={`w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r ${theme.ctaGradient} font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all duration-200 hover:shadow-2xl hover:scale-[1.01]`}
            >
              <CtaIcon className="w-4 h-4 flex-shrink-0" />
              <span>{cta.label}</span>
            </a>

            {/* Quick helper note */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Munnalal Painter • Lucknow</span>
              <a 
                href={`tel:${cleanPhone(officialPhone)}`}
                className="hover:text-white transition-colors underline decoration-slate-600"
              >
                Call: {officialPhone}
              </a>
            </div>
          </div>

          {/* Admin Preview Mode Notice */}
          {isPreview && (
            <div className="p-2 rounded-xl bg-indigo-950/70 border border-indigo-700/60 text-indigo-300 text-[11px] text-center font-medium">
              💡 Admin Preview Mode (Cooldown bypassed for live testing)
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FestivalPopup;
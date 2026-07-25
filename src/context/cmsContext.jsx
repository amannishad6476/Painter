import React, { createContext, useContext, useState, useEffect } from 'react';

const CMSContext = createContext();

// Initial Default State for website content
const defaultContactInfo = {
  phone: '+91 76684 15684',
  altPhone: '+91 83037 19864',
  whatsapp: '+91 83037 19864',
  email: 'info@lucknowpainter.in',
  address: 'Vibhuti Khand, Gomti Nagar, Lucknow - 226010',
  timings: 'Mon - Sun: 8:00 AM - 9:00 PM',
  businessHoursDetail: 'Open 7 Days a week. Instant site visits available in Lucknow.'
};

const defaultMapInfo = {
  address: 'Vibhuti Khand, Gomti Nagar, Lucknow - 226010',
  latitude: '26.8530',
  longitude: '81.0003',
  mapEmbedUrl: 'https://maps.google.com/maps?q=26.8530,81.0003&z=15&output=embed'
};

const defaultBanner = {
  bgImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=1600',
  badgeText: '#1 Rated Painting Contractor in Lucknow',
  title: 'Professional Painter Services in Lucknow',
  subtitle: 'Affordable, Trusted & Professional Painting Solutions. Transform your home & office with dust-free sanding, waterproof coatings, and premium Asian Paints finish.',
  ratingScore: '4.9/5 Rating',
  ratingSubtext: 'based on 500+ home painting projects across Lucknow (Gomti Nagar, Hazratganj, Alambagh).',
  bullets: [
    '100% Dust-Free Machine Sanding',
    'Asian Paints & Berger Certified',
    'Transparent Sq.Ft Pricing',
    'Clean Post-Paint Deep Clean'
  ],
  stats: [
    { label: 'Years Experience in Lucknow', value: '10+' },
    { label: 'Happy Homes Painted', value: '500+' },
    { label: 'On-Time Completion', value: '100%' },
    { label: 'Service Warranty', value: '3 Year' }
  ]
};

const defaultAbout = {
  badgeText: 'About Munnalal Painter',
  headline: 'Your Trusted Painting Partner in Lucknow',
  subheading: 'We bring professional craftsmanship, premium paint materials, and transparent square-foot pricing to every residential and commercial painting project in Lucknow.',
  storyTitle: 'Transforming Homes Across Hazratganj, Gomti Nagar & Alambagh',
  paragraph1: 'With over a decade of hands-on experience, Munnalal Painter is Lucknow’s premier choice for house painting, texture artwork, wall putty preparation, waterproofing, and POP false ceilings.',
  paragraph2: 'We understand the local climate conditions in Uttar Pradesh—from scorching summers to heavy monsoon dampness. That’s why we use custom damp-proof sealants and UV-resistant exterior coatings to ensure your walls stay vibrant for years.',
  featureImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
  qualityGuarantee: '100% Quality & Shade Guarantee',
  highlights: [
    'Asian Paints Approved',
    'On-Time Completion',
    'Fixed Rate Guarantee',
    'Furniture Masking'
  ],
  processSteps: [
    { num: '01', title: 'Free Site Inspection', desc: 'Our painter expert visits your house in Lucknow, measures wall square footage, checks dampness, and recommends ideal products.' },
    { num: '02', title: 'Transparent Quotation', desc: 'Get an accurate itemized estimate with material costs (Asian Paints / Berger) and labor charges with no hidden fees.' },
    { num: '03', title: 'Dust-Free Execution', desc: 'Furniture & flooring masking followed by machine sanding and multi-coat precision painting by trained professionals.' },
    { num: '04', title: 'Post-Paint Deep Clean', desc: 'We remove all masking tapes, clean paint drips from tiles, and hand over your spotlessly fresh home on time.' }
  ]
};

const defaultServices = [
  {
    id: 's1',
    title: 'House Painting',
    category: 'Full House Painting',
    description: 'Complete interior and exterior house painting solutions with premium durability and flawless finish.',
    priceRange: '₹12 - ₹28 / sq.ft',
    features: ['Dust-free Sanding', 'Masking & Floor Protection', '2 Coats Premium Emulsion', 'Color Consultation'],
    iconName: 'Home',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's2',
    title: 'Interior Painting',
    category: 'Interior Painting',
    description: 'Transform your living spaces with smooth, washable interior paints and designer shade combinations.',
    priceRange: '₹14 - ₹32 / sq.ft',
    features: ['Odorless Low-VOC Paints', 'Stain Resistant Coating', 'Wall Crack Filling', 'Smooth Velvet Finish'],
    iconName: 'Paintbrush',
    image: 'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's3',
    title: 'Exterior Painting',
    category: 'Exterior Painting',
    description: 'Weather-proof exterior wall coatings that protect against Lucknow moisture, heat, and fungal growth.',
    priceRange: '₹18 - ₹38 / sq.ft',
    features: ['UV Protection Coating', 'Anti-Fungal Guard', '10-Year Weather Protection', 'High Pressure Cleaning'],
    iconName: 'Sun',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's4',
    title: 'Texture Painting',
    category: 'Texture Painting',
    description: 'Artistic feature wall textures including Metallic, Royale Play, Velvet, Rust, and Marble finishes.',
    priceRange: '₹45 - ₹120 / sq.ft',
    features: ['Custom Pattern Stencils', '3D Metallic Accents', 'Scratch Resistant', 'Luxury Focal Walls'],
    iconName: 'Palette',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's5',
    title: 'Wall Putty',
    category: 'Wall Putty',
    description: 'High-grade white cement putty application ensuring smooth, level walls and extended paint life.',
    priceRange: '₹6 - ₹12 / sq.ft',
    features: ['Double Coat Application', 'Water Resistant Layer', 'Flawless Base for Emulsion', 'Machine Sanding'],
    iconName: 'Layers',
    image: 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's6',
    title: 'Waterproofing',
    category: 'Waterproofing',
    description: 'Advanced damp-proof sealants for roofs, terraces, bathrooms, and exterior damp walls.',
    priceRange: '₹30 - ₹75 / sq.ft',
    features: ['Elastomeric Membrane', 'Crack Bridging Tech', 'Terrace Heat Reflection', '5-7 Year Warranty'],
    iconName: 'Droplets',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's7',
    title: 'POP Design',
    category: 'POP Design',
    description: 'Modern false ceiling POP designs, wall molding, cornices, and decorative ceiling lights integration.',
    priceRange: '₹65 - ₹150 / sq.ft',
    features: ['Custom False Ceilings', 'Gypsum & Plaster Mouldings', 'LED Groove Lighting Prep', 'Thermal Insulation'],
    iconName: 'Grid',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's8',
    title: 'Wood Polish',
    category: 'Wood Polish',
    description: 'Premium PU, melamine, and spirit polish for wooden doors, furniture, cabinets, and staircases.',
    priceRange: '₹35 - ₹90 / sq.ft',
    features: ['Gloss & Matte Finishes', 'Scratch Protection', 'Termite Resistant Sealant', 'Rich Timber Polish'],
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800'
  }
];

const defaultGallery = [
  {
    id: 'g8',
    title: 'Gomti Nagar 4BHK Full House Painting Transformation',
    category: 'Full House Painting',
    mediaType: 'photo',
    afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    location: 'Gomti Nagar Extension, Lucknow',
    completionDate: 'July 2026',
    description: 'Complete interior velvet emulsion & exterior weather protection for luxury 4BHK villa.',
    createdAt: 1784793600000
  },
  {
    id: 'g1',
    title: 'Hazratganj Modern Living Room Emulsion',
    category: 'Interior Painting',
    mediaType: 'photo',
    afterImage: 'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?auto=format&fit=crop&q=80&w=800',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    location: 'Hazratganj, Lucknow',
    completionDate: 'June 2026',
    description: 'Royal Royale Matte finish with zero-VOC odorless paint.',
    createdAt: 1782201600000
  },
  {
    id: 'g2',
    title: 'Alambagh Duplex Weatherproofing Exterior',
    category: 'Exterior Painting',
    mediaType: 'photo',
    afterImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
    beforeImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
    location: 'Alambagh, Lucknow',
    completionDate: 'June 2026',
    description: 'Apex Ultima weather proofing & elastomeric exterior coating.',
    createdAt: 1781596800000
  },
  {
    id: 'g4',
    title: 'Mahanagar Royale Metallic Texture Feature Wall',
    category: 'Texture Painting',
    mediaType: 'photo',
    afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    beforeImage: 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?auto=format&fit=crop&q=80&w=800',
    location: 'Mahanagar, Lucknow',
    completionDate: 'May 2026',
    description: '3D Metallic Royal Play accent texture wall with custom geometric stencils.',
    createdAt: 1779609600000
  },
  {
    id: 'g7',
    title: 'Jankipuram Machine Sanding & Double Putty',
    category: 'Wall Putty',
    mediaType: 'photo',
    afterImage: 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?auto=format&fit=crop&q=80&w=800',
    location: 'Jankipuram, Lucknow',
    completionDate: 'May 2026',
    description: '2 coats white cement putty with dustless machine sanding for mirror wall base.',
    createdAt: 1778918400000
  },
  {
    id: 'g5',
    title: 'Indira Nagar Terrace Damp Proof Video Showcase',
    category: 'Waterproofing',
    mediaType: 'video',
    afterImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    location: 'Indira Nagar, Lucknow',
    completionDate: 'April 2026',
    description: 'Video walkthrough of elastomeric roof waterproofing membrane application.',
    createdAt: 1776297600000
  },
  {
    id: 'g3',
    title: 'Ashiyana Gypsum POP Ceiling with LED Groove',
    category: 'POP Design',
    mediaType: 'photo',
    afterImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
    beforeImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
    location: 'Ashiyana, Lucknow',
    completionDate: 'April 2026',
    description: 'Designer false ceiling POP molding with integrated dual LED cove channels.',
    createdAt: 1775606400000
  },
  {
    id: 'g6',
    title: 'Vikas Nagar Main Teak Door PU Polish Video',
    category: 'Wood Polish',
    mediaType: 'video',
    afterImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    location: 'Vikas Nagar, Lucknow',
    completionDate: 'March 2026',
    description: 'High gloss polyurethane clear wood polish video demonstration.',
    createdAt: 1773014400000
  }
];

const defaultTestimonials = [
  {
    id: 't1',
    name: 'Rajesh Sharma',
    location: 'Gomti Nagar Extension, Lucknow',
    rating: 5,
    projectCategory: 'Interior Painting',
    comment: 'Munnalal Painter did a fantastic job on our 3BHK flat! They used dust-free sanding machines so there was no dust mess. Highly recommended for house painting in Lucknow.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    date: '2 weeks ago'
  },
  {
    id: 't2',
    name: 'Priya Verma',
    location: 'Hazratganj, Lucknow',
    rating: 5,
    projectCategory: 'Texture Painting',
    comment: 'The Royale metallic texture accent wall in my living room turned out stunning! Munnalal Ji personally guided us on shade selection.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    date: '1 month ago'
  },
  {
    id: 't3',
    name: 'Amitabh Srivastava',
    location: 'Indira Nagar, Lucknow',
    rating: 5,
    projectCategory: 'Waterproofing',
    comment: 'We were facing heavy wall dampness and paint peeling every monsoon. Their Dr. Fixit damp-proof coating completely solved the issue.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    date: '1 month ago'
  }
];

// ─── Security Constants ────────────────────────────────────────────────────
const HASH_KEY       = 'munnalal_admin_hash';   // { hash: string, salt: string }
const RATE_KEY       = 'munnalal_rate_limit';    // { attempts: number, lockedUntil: number }
const MAX_ATTEMPTS   = 5;
const LOCKOUT_MS     = 15 * 60 * 1000; // 15 minutes

/** Encode ArrayBuffer → base64 string */
const ab2b64 = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)));

/** Decode base64 string → Uint8Array */
const b642ab = (b64) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/**
 * Hash a plaintext password using PBKDF2-SHA256 (100 000 iterations).
 * Returns { hash: string (base64), salt: string (base64) }.
 */
const hashPassword = async (password) => {
  const enc    = new TextEncoder();
  const saltBuf = crypto.getRandomValues(new Uint8Array(16));
  const keyMat  = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBuf, iterations: 100_000 },
    keyMat, 256
  );
  return { hash: ab2b64(derived), salt: ab2b64(saltBuf) };
};

/**
 * Verify a plaintext password against a stored { hash, salt }.
 * Returns true if they match.
 */
const verifyPassword = async (password, storedHash, storedSalt) => {
  const enc     = new TextEncoder();
  const saltBuf = b642ab(storedSalt);
  const keyMat  = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBuf, iterations: 100_000 },
    keyMat, 256
  );
  return ab2b64(derived) === storedHash;
};

/**
 * Validate password complexity.
 * Returns { valid: boolean, errors: string[] }
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  if (!password || password.length < 8)
    errors.push('At least 8 characters required.');
  if (!/[A-Z]/.test(password))
    errors.push('Must contain at least 1 uppercase letter.');
  if (!/[a-z]/.test(password))
    errors.push('Must contain at least 1 lowercase letter.');
  if (!/[0-9]/.test(password))
    errors.push('Must contain at least 1 number.');
  if (!/[^A-Za-z0-9]/.test(password))
    errors.push('Must contain at least 1 special character (@, #, $, %, etc.).');
  return { valid: errors.length === 0, errors };
};

export const CMSProvider = ({ children }) => {
  // Auth state — no plain-text password is ever held in React state.
  // We only track whether the session is authenticated.
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('munnalal_admin_auth') === 'true';
  });

  // Detect first-time setup (no hash stored yet)
  const [needsSetup, setNeedsSetup] = useState(() => {
    return !localStorage.getItem(HASH_KEY);
  });

  // Content states
  const [contactInfo, setContactInfo] = useState(() => {
    const saved = localStorage.getItem('munnalal_contact_info');
    return saved ? JSON.parse(saved) : defaultContactInfo;
  });

  const [mapInfo, setMapInfo] = useState(() => {
    const saved = localStorage.getItem('munnalal_map_info');
    return saved ? JSON.parse(saved) : defaultMapInfo;
  });

  const [banner, setBanner] = useState(() => {
    const saved = localStorage.getItem('munnalal_banner');
    return saved ? JSON.parse(saved) : defaultBanner;
  });

  const [aboutContent, setAboutContent] = useState(() => {
    const saved = localStorage.getItem('munnalal_about');
    return saved ? JSON.parse(saved) : defaultAbout;
  });

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('munnalal_services');
    return saved ? JSON.parse(saved) : defaultServices;
  });

  const [gallery, setGallery] = useState(() => {
    const saved = localStorage.getItem('munnalal_gallery');
    return saved ? JSON.parse(saved) : defaultGallery;
  });

  const [testimonials, setTestimonials] = useState(() => {
    const saved = localStorage.getItem('munnalal_testimonials');
    return saved ? JSON.parse(saved) : defaultTestimonials;
  });

  const [estimates, setEstimates] = useState(() => {
    const saved = localStorage.getItem('munnalal_estimates');
    return saved ? JSON.parse(saved) : [];
  });

  const [contactLeads, setContactLeads] = useState(() => {
    const saved = localStorage.getItem('munnalal_leads');
    return saved ? JSON.parse(saved) : [];
  });

  // Save changes to LocalStorage & try syncing backend
  useEffect(() => {
    localStorage.setItem('munnalal_contact_info', JSON.stringify(contactInfo));
  }, [contactInfo]);

  useEffect(() => {
    localStorage.setItem('munnalal_map_info', JSON.stringify(mapInfo));
  }, [mapInfo]);

  useEffect(() => {
    localStorage.setItem('munnalal_banner', JSON.stringify(banner));
  }, [banner]);

  useEffect(() => {
    localStorage.setItem('munnalal_about', JSON.stringify(aboutContent));
  }, [aboutContent]);

  useEffect(() => {
    localStorage.setItem('munnalal_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('munnalal_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('munnalal_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('munnalal_estimates', JSON.stringify(estimates));
  }, [estimates]);

  useEffect(() => {
    localStorage.setItem('munnalal_leads', JSON.stringify(contactLeads));
  }, [contactLeads]);

  // ─── Rate-limit helpers ──────────────────────────────────────────────────
  const getRateLimitStatus = () => {
    try {
      const raw = sessionStorage.getItem(RATE_KEY);
      if (!raw) return { locked: false, attempts: 0, lockedUntil: null, remaining: MAX_ATTEMPTS };
      const data = JSON.parse(raw);
      const now  = Date.now();
      if (data.lockedUntil && now < data.lockedUntil) {
        return {
          locked: true,
          attempts: data.attempts,
          lockedUntil: data.lockedUntil,
          msRemaining: data.lockedUntil - now,
          remaining: 0
        };
      }
      // Lockout expired — reset
      if (data.lockedUntil && now >= data.lockedUntil) {
        sessionStorage.removeItem(RATE_KEY);
        return { locked: false, attempts: 0, lockedUntil: null, remaining: MAX_ATTEMPTS };
      }
      return {
        locked: false,
        attempts: data.attempts || 0,
        lockedUntil: null,
        remaining: MAX_ATTEMPTS - (data.attempts || 0)
      };
    } catch {
      return { locked: false, attempts: 0, lockedUntil: null, remaining: MAX_ATTEMPTS };
    }
  };

  const recordFailedAttempt = () => {
    const status = getRateLimitStatus();
    const newAttempts = (status.attempts || 0) + 1;
    const payload = { attempts: newAttempts };
    if (newAttempts >= MAX_ATTEMPTS) {
      payload.lockedUntil = Date.now() + LOCKOUT_MS;
    }
    sessionStorage.setItem(RATE_KEY, JSON.stringify(payload));
    return payload;
  };

  const resetRateLimit = () => {
    sessionStorage.removeItem(RATE_KEY);
  };

  // ─── Login (async, PBKDF2-verified) ─────────────────────────────────────
  const login = async (pass) => {
    // Check rate-limit first
    const status = getRateLimitStatus();
    if (status.locked) {
      const mins = Math.ceil(status.msRemaining / 60000);
      return {
        success: false,
        locked: true,
        error: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`,
        msRemaining: status.msRemaining
      };
    }

    // First-time setup: no hash stored yet
    const storedRaw = localStorage.getItem(HASH_KEY);
    if (!storedRaw) {
      return {
        success: false,
        needsSetup: true,
        error: 'No admin password set yet. Please set a password below.'
      };
    }

    const { hash, salt } = JSON.parse(storedRaw);
    const matches = await verifyPassword(pass, hash, salt);

    if (matches) {
      resetRateLimit();
      setIsAuthenticated(true);
      sessionStorage.setItem('munnalal_admin_auth', 'true');
      return { success: true };
    }

    // Wrong password
    const updated = recordFailedAttempt();
    const attemptsLeft = MAX_ATTEMPTS - updated.attempts;
    if (attemptsLeft <= 0) {
      return {
        success: false,
        locked: true,
        error: `Too many failed attempts. Account locked for 15 minutes.`,
        msRemaining: LOCKOUT_MS
      };
    }
    return {
      success: false,
      error: `Incorrect password. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before lockout.`,
      attemptsLeft
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('munnalal_admin_auth');
  };

  // ─── Change passcode (async, validates strength + hashes) ───────────────
  const changePasscode = async (newPass) => {
    const { valid, errors } = validatePasswordStrength(newPass || '');
    if (!valid) {
      return { success: false, errors, error: errors[0] };
    }
    try {
      const { hash, salt } = await hashPassword(newPass);
      localStorage.setItem(HASH_KEY, JSON.stringify({ hash, salt }));
      // Remove legacy plain-text key if present
      localStorage.removeItem('munnalal_admin_pass');
      setNeedsSetup(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to hash password. Please try again.' };
    }
  };

  // ─── First-time setup: hash password AND auto-authenticate in one step ───
  // Called from the login screen when needsSetup === true. On success the
  // admin is immediately logged in without a separate login step.
  const setupInitialPassword = async (newPass) => {
    const { valid, errors } = validatePasswordStrength(newPass || '');
    if (!valid) {
      return { success: false, errors, error: errors[0] };
    }
    try {
      const { hash, salt } = await hashPassword(newPass);
      localStorage.setItem(HASH_KEY, JSON.stringify({ hash, salt }));
      localStorage.removeItem('munnalal_admin_pass'); // clean up legacy key
      setNeedsSetup(false);
      // Auto-login immediately after setup
      setIsAuthenticated(true);
      sessionStorage.setItem('munnalal_admin_auth', 'true');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to create password. Please try again.' };
    }
  };

  // Convert File object to Base64 String
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Update handlers
  const updateContactInfo = (data) => setContactInfo(prev => ({ ...prev, ...data }));
  
  const updateMapInfo = (data) => {
    setMapInfo(prev => {
      const updated = { ...prev, ...data };
      if (data.address && data.address !== contactInfo.address) {
        setContactInfo(c => ({ ...c, address: data.address }));
      }
      return updated;
    });
  };

  const updateBanner = (data) => setBanner(prev => ({ ...prev, ...data }));
  const updateAbout = (data) => setAboutContent(prev => ({ ...prev, ...data }));

  // Service CRUD
  const addService = (item) => {
    const newItem = { id: 's_' + Date.now(), ...item };
    setServices(prev => [newItem, ...prev]);
  };
  const updateService = (id, data) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };
  const deleteService = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Gallery CRUD (Sorted latest first)
  const addGalleryItem = (item) => {
    const newItem = { 
      id: 'g_' + Date.now(), 
      createdAt: Date.now(),
      completionDate: item.completionDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      ...item 
    };
    setGallery(prev => [newItem, ...prev]);
  };
  const updateGalleryItem = (id, data) => {
    setGallery(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  };
  const deleteGalleryItem = (id) => {
    setGallery(prev => prev.filter(g => g.id !== id));
  };

  // Testimonials CRUD
  const addTestimonial = (item) => {
    const newItem = { id: 't_' + Date.now(), date: 'Just now', ...item };
    setTestimonials(prev => [newItem, ...prev]);
  };
  const updateTestimonial = (id, data) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };
  const deleteTestimonial = (id) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  // Leads
  const addEstimate = (estimate) => {
    const newEst = { id: 'est_' + Date.now(), createdAt: new Date().toISOString(), ...estimate };
    setEstimates(prev => [newEst, ...prev]);
  };
  const deleteEstimate = (id) => {
    setEstimates(prev => prev.filter(e => e.id !== id));
  };

  const addContactLead = (lead) => {
    const newLead = { id: 'lead_' + Date.now(), createdAt: new Date().toISOString(), ...lead };
    setContactLeads(prev => [newLead, ...prev]);
  };
  const deleteContactLead = (id) => {
    setContactLeads(prev => prev.filter(l => l.id !== id));
  };

  return (
    <CMSContext.Provider value={{
      isAuthenticated,
      needsSetup,
      login,
      logout,
      changePasscode,
      getRateLimitStatus,
      setupInitialPassword,
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
      addEstimate,
      deleteEstimate,
      contactLeads,
      addContactLead,
      deleteContactLead
    }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};

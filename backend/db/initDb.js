import { query } from '../config/db.js';

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

export const initDb = async () => {
  try {
    console.log('📦 Initializing Database Tables & Seeding Defaults...');

    // Singletons table (contact_info, map_info, banner, about_content)
    await query(`
      CREATE TABLE IF NOT EXISTS singletons (
        key VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Services table
    await query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Gallery table
    await query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Testimonials table
    await query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Estimates table
    await query(`
      CREATE TABLE IF NOT EXISTS estimates (
        id VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Leads table
    await query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin Auth table
    await query(`
      CREATE TABLE IF NOT EXISTS admin_auth (
        id INT PRIMARY KEY DEFAULT 1,
        hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed Singletons if missing
    const contactRes = await query(`SELECT data FROM singletons WHERE key = 'contact_info'`);
    if (contactRes.rows.length === 0) {
      await query(`INSERT INTO singletons (key, data) VALUES ($1, $2)`, ['contact_info', JSON.stringify(defaultContactInfo)]);
    }

    const mapRes = await query(`SELECT data FROM singletons WHERE key = 'map_info'`);
    if (mapRes.rows.length === 0) {
      await query(`INSERT INTO singletons (key, data) VALUES ($1, $2)`, ['map_info', JSON.stringify(defaultMapInfo)]);
    }

    const bannerRes = await query(`SELECT data FROM singletons WHERE key = 'banner'`);
    if (bannerRes.rows.length === 0) {
      await query(`INSERT INTO singletons (key, data) VALUES ($1, $2)`, ['banner', JSON.stringify(defaultBanner)]);
    }

    const aboutRes = await query(`SELECT data FROM singletons WHERE key = 'about_content'`);
    if (aboutRes.rows.length === 0) {
      await query(`INSERT INTO singletons (key, data) VALUES ($1, $2)`, ['about_content', JSON.stringify(defaultAbout)]);
    }

    // Seed Services if missing
    const servicesRes = await query(`SELECT id FROM services`);
    if (servicesRes.rows.length === 0) {
      for (const service of defaultServices) {
        await query(`INSERT INTO services (id, data) VALUES ($1, $2)`, [service.id, JSON.stringify(service)]);
      }
    }

    // Seed Gallery if missing
    const galleryRes = await query(`SELECT id FROM gallery`);
    if (galleryRes.rows.length === 0) {
      for (const item of defaultGallery) {
        await query(`INSERT INTO gallery (id, data) VALUES ($1, $2)`, [item.id, JSON.stringify(item)]);
      }
    }

    // Seed Testimonials if missing
    const testimonialsRes = await query(`SELECT id FROM testimonials`);
    if (testimonialsRes.rows.length === 0) {
      for (const t of defaultTestimonials) {
        await query(`INSERT INTO testimonials (id, data) VALUES ($1, $2)`, [t.id, JSON.stringify(t)]);
      }
    }

    // Seed Admin Auth default password (aradhya#2255) if missing
    const authRes = await query(`SELECT id FROM admin_auth WHERE id = 1`);
    if (authRes.rows.length === 0) {
      await query(
        `INSERT INTO admin_auth (id, hash, salt) VALUES (1, $1, $2)`,
        ['1+fqKl7800AftPztia5bwon5RSXUANxD8ErmEGmzEa8=', 'lpc8jRgcdvJIGtiaEXIVlQ==']
      );
    }

    console.log('✅ Database Initialization & Defaults Seeding Complete!');
  } catch (err) {
    console.error('Error during DB Initialization:', err);
  }
};

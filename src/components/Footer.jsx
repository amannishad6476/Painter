import React from 'react';
import { Phone, Mail, MapPin, Heart, ShieldCheck, Clock, Navigation } from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const Footer = ({ setActiveTab }) => {
  const { contactInfo, mapInfo } = useCMS();

  const handleNav = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cleanPhone = (p) => p ? p.replace(/[^0-9+]/g, '') : '';

  const lat = mapInfo?.latitude || '26.8530';
  const lng = mapInfo?.longitude || '81.0003';
  const address = mapInfo?.address || contactInfo?.address || 'Lucknow';

  const directionsUrl = (lat && lng)
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('home')}>
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-slate-700 bg-slate-900">
                <img
                  src="/assets/logo.png"
                  alt="Lucknow Painter Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-black text-white font-outfit">
                Munnalal<span className="text-brand-500">Painter</span>
              </span>
            </div>

            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Munnalal Painter - professional painting services in Lucknow. Specializing in interior/exterior painting, POP design, texture walls, wood polish, wall putty preparation, and damp proof waterproofing.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified Asian Paints & Berger Material Partner</span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base font-outfit">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handleNav('home')} className="hover:text-brand-400 transition-colors">Home</button></li>
              <li><button onClick={() => handleNav('about')} className="hover:text-brand-400 transition-colors">About Us</button></li>
              <li><button onClick={() => handleNav('services')} className="hover:text-brand-400 transition-colors">All Services</button></li>
              <li><button onClick={() => handleNav('gallery')} className="hover:text-brand-400 transition-colors">Work Gallery</button></li>
              <li><button onClick={() => handleNav('testimonials')} className="hover:text-brand-400 transition-colors">Testimonials</button></li>
              <li><button onClick={() => handleNav('pricing')} className="hover:text-brand-400 transition-colors">Price Estimator</button></li>
              <li><button onClick={() => handleNav('contact')} className="hover:text-brand-400 transition-colors">Contact Us</button></li>
              <li><button onClick={() => handleNav('admin')} className="hover:text-brand-400 transition-colors text-indigo-400 font-bold">Admin Portal</button></li>
            </ul>
          </div>

          {/* Col 4: Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base font-outfit">Gallery Sections</h4>
            <ul className="space-y-2 text-sm">
              <li>Interior Painting</li>
              <li>Exterior Painting</li>
              <li>POP Design</li>
              <li>Texture Painting</li>
              <li>Waterproofing</li>
              <li>Wood Polish</li>
              <li>Wall Putty</li>
            </ul>
          </div>

          {/* Col 5: Contact Info & Directions */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base font-outfit">Lucknow Office & Hours</h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-1" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <a href={`tel:${cleanPhone(contactInfo.phone)}`} className="hover:text-white">{contactInfo.phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-white">{contactInfo.email}</a>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-medium text-xs pt-1">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{contactInfo.timings}</span>
              </div>

              <div className="pt-2">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Munnalal Painter - professional painting services in Lucknow. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for homes in Lucknow, UP
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

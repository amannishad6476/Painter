import React from 'react';
import { Phone, MessageSquare, Navigation } from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const FloatingCTA = () => {
  const { contactInfo, mapInfo } = useCMS();
  const cleanPhone = (p) => p ? p.replace(/[^0-9+]/g, '') : '';

  const lat = mapInfo?.latitude || '26.8530';
  const lng = mapInfo?.longitude || '81.0003';
  const address = mapInfo?.address || contactInfo?.address || 'Lucknow';
  
  const directionsUrl = (lat && lng) 
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {/* Floating Directions Button */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
        title="Get Directions on Google Maps"
      >
        <Navigation className="w-6 h-6 fill-white" />
        <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          Get Directions to Shop
        </span>
      </a>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${cleanPhone(contactInfo.whatsapp)}?text=Hi%20Munnalal%20Painter,%20I%20want%20to%20get%20a%20painting%20quote.`}
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
        title="Chat on WhatsApp"
      >
        <MessageSquare className="w-7 h-7 fill-white" />
        <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          WhatsApp: {contactInfo.whatsapp}
        </span>
      </a>

      {/* Floating Call Button */}
      <a
        href={`tel:${cleanPhone(contactInfo.phone)}`}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce"
        title="Call Now"
      >
        <Phone className="w-6 h-6" />
        <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          Call {contactInfo.phone}
        </span>
      </a>
    </div>
  );
};

export default FloatingCTA;

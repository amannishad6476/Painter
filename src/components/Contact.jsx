import React from 'react';
import { Phone, MessageSquare, Mail, MapPin, Send, CheckCircle2, Clock, Navigation, ExternalLink } from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const Contact = () => {
  const { contactInfo, mapInfo, addContactLead } = useCMS();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    service: 'House Painting',
    message: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.phone || !formData.message) {
      setError('Please fill in your Name, Phone Number, and Message.');
      return;
    }

    setLoading(true);
    try {
      await addContactLead(formData);
      setLoading(false);
      setSubmitted(true);
    } catch (err) {
      setLoading(false);
      setError('Connection error. Please try calling or WhatsApp directly.');
    }
  };

  const cleanPhone = (p) => p ? p.replace(/[^0-9+]/g, '') : '';

  // Get active embed URL or build from Lat/Lng
  const getEmbedUrl = () => {
    if (mapInfo?.mapEmbedUrl && mapInfo.mapEmbedUrl.includes('http')) {
      if (mapInfo.mapEmbedUrl.includes('<iframe')) {
        const match = mapInfo.mapEmbedUrl.match(/src=["']([^"']+)["']/);
        if (match && match[1]) return match[1];
      }
      return mapInfo.mapEmbedUrl;
    }
    const lat = mapInfo?.latitude || '26.8530';
    const lng = mapInfo?.longitude || '81.0003';
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  };

  const lat = mapInfo?.latitude || '26.8530';
  const lng = mapInfo?.longitude || '81.0003';
  const address = mapInfo?.address || contactInfo?.address || 'Vibhuti Khand, Gomti Nagar, Lucknow - 226010';
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <section id="contact" className="py-20 bg-slate-100 dark:bg-slate-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-3.5 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-bold text-xs uppercase tracking-wider">
            Get In Touch & Visit Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-outfit">
            Contact & Find Munnalal Painter in Lucknow
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Have questions or want to schedule a free shade consultation? Reach out via phone, WhatsApp, email, or visit our office.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Phone Card */}
            <a
              href={`tel:${cleanPhone(contactInfo.phone)}`}
              className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl hover:border-brand-500 transition-all group"
            >
              <div className="p-4 rounded-xl bg-brand-500 text-white group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Call Helpline</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{contactInfo.phone} {contactInfo.altPhone ? `/ ${contactInfo.altPhone}` : ''}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{contactInfo.timings}</div>
              </div>
            </a>

            {/* WhatsApp Card */}
            <a
              href={`https://wa.me/${cleanPhone(contactInfo.whatsapp)}?text=Hi%20Munnalal%20Painter,%20I%20need%20painting%20services%20information.`}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl hover:border-emerald-500 transition-all group"
            >
              <div className="p-4 rounded-xl bg-emerald-600 text-white group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instant WhatsApp Chat</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{contactInfo.whatsapp}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Fastest Response (Instant Reply)</div>
              </div>
            </a>

            {/* Email Card */}
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
              <div className="p-4 rounded-xl bg-amber-500 text-white">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Inquiry</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">{contactInfo.email}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Response within 2 hours</div>
              </div>
            </div>

            {/* Address, Timings & Get Directions */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Lucknow Head Office</div>
                  <div className="text-sm font-medium mt-1">{address}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-3 border-t border-slate-800">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Business Operating Hours</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">{contactInfo.timings}</div>
                  <div className="text-xs text-slate-400">{contactInfo.businessHoursDetail}</div>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">
                  Send Us a Direct Message
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill out the form below and Munnalal Painter will call you back within 15 minutes.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Thank You! Message Received</h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Our Lucknow painting supervisor will call you back shortly on <strong>{formData.phone}</strong> to confirm your site visit.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', service: 'House Painting', message: '' }); }}
                    className="mt-4 px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Verma"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Email Address (Optional)</label>
                      <input
                        type="email"
                        placeholder="e.g. ramesh@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Service Required</label>
                      <select
                        value={formData.service}
                        onChange={e => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      >
                        <option value="Interior Painting">Interior Painting</option>
                        <option value="Exterior Painting">Exterior Painting</option>
                        <option value="POP Design">POP Design</option>
                        <option value="Texture Painting">Texture Painting</option>
                        <option value="Waterproofing">Waterproofing</option>
                        <option value="Wood Polish">Wood Polish</option>
                        <option value="Wall Putty">Wall Putty</option>
                        <option value="All Projects">Full House Painting</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Message / Requirements *</label>
                    <textarea
                      rows="4"
                      required
                      placeholder="Specify house area in sq.ft, Lucknow location (e.g., Gomti Nagar), or requested start date..."
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all"
                  >
                    {loading ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message & Book Inspection</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

        {/* Clickable Interactive Google Map Section with Displayed Address Below */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>Interactive Business Location</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-outfit mt-0.5">
                Our Office Location on Google Maps
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Click anywhere on the map or button below to start navigation.
              </p>
            </div>

            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-transform hover:scale-105"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Interactive Map Frame */}
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 group cursor-pointer">
            <iframe
              title="Munnalal Painter Lucknow Google Map"
              src={getEmbedUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>

          {/* Business Address Displayed Prominently Below the Map */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>Official Business Destination</span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {address}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Coordinates: Latitude <strong>{lat}</strong>, Longitude <strong>{lng}</strong>
              </div>
            </div>

            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <Navigation className="w-4 h-4" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact;

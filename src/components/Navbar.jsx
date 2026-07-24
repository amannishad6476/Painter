import React, { useState, useEffect } from 'react';
import { Phone, Sun, Moon, Menu, X, ChevronDown, Layers } from 'lucide-react';
import { useCMS } from '../context/cmsContext';

const Navbar = ({ activeTab, setActiveTab, isDarkMode, toggleDarkMode, onOpenServicePage }) => {
  const { contactInfo } = useCMS();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const servicePages = [
    { label: 'House Painting', slug: 'house-painting' },
    { label: 'Interior Painting', slug: 'interior-painting' },
    { label: 'Exterior Painting', slug: 'exterior-painting' },
    { label: 'Texture Painting', slug: 'texture-painting' },
    { label: 'Wall Putty', slug: 'wall-putty' },
    { label: 'Waterproofing', slug: 'waterproofing' },
  ];

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services', isDropdown: true },
    { id: 'gallery', label: 'Portfolio' },
    { id: 'testimonials', label: 'Reviews' },
    { id: 'pricing', label: 'Price Estimate' },
    { id: 'contact', label: 'Contact' },
    { id: 'admin', label: 'Admin', badge: 'CMS' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServiceSelect = (slug) => {
    setServicesDropdownOpen(false);
    setMobileMenuOpen(false);
    onOpenServicePage(slug);
  };

  const cleanPhone = (p) => p ? p.replace(/[^0-9+]/g, '') : '';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-nav shadow-lg py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-200 border border-slate-200/50 dark:border-slate-700/50 bg-slate-900">
            <img
              src="/assets/logo.png"
              alt="Munnalal Painter - House Painter & Wall Painting Services Lucknow Logo"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 font-outfit">
              Munnalal<span className="text-brand-500">Painter</span>
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">
              Pro Painting & Waterproofing
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            if (item.isDropdown) {
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleNavClick('services')}
                    onMouseEnter={() => setServicesDropdownOpen(true)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      activeTab === 'services' || activeTab.startsWith('service-')
                        ? 'text-brand-600 dark:text-brand-400 font-semibold bg-brand-50/80 dark:bg-slate-800/80'
                        : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown Menu */}
                  <div 
                    onMouseLeave={() => setServicesDropdownOpen(false)}
                    className="absolute left-0 top-full pt-2 w-56 hidden group-hover:block z-50"
                  >
                    <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-1">
                      {servicePages.map(sp => (
                        <button
                          key={sp.slug}
                          onClick={() => handleServiceSelect(sp.slug)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <Layers className="w-3.5 h-3.5 text-brand-500 group-hover:text-white" />
                          <span>{sp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  activeTab === item.id
                    ? 'text-brand-600 dark:text-brand-400 font-semibold bg-brand-50/80 dark:bg-slate-800/80'
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons & Theme Switcher */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          <a
            href={`tel:${cleanPhone(contactInfo.phone)}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold text-sm shadow-md hover:shadow-brand-500/25 transition-all duration-200"
          >
            <Phone className="w-4 h-4 animate-bounce" />
            <span>Call: {contactInfo.phone}</span>
          </a>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-2 mt-2 shadow-2xl max-h-[80vh] overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between ${
                  activeTab === item.id
                    ? 'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-100 text-indigo-700">
                    {item.badge}
                  </span>
                )}
              </button>

              {item.isDropdown && (
                <div className="pl-4 pt-1 pb-2 space-y-1">
                  {servicePages.map(sp => (
                    <button
                      key={sp.slug}
                      onClick={() => handleServiceSelect(sp.slug)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Layers className="w-3 h-3 text-brand-500" />
                      <span>{sp.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <a
              href={`tel:${cleanPhone(contactInfo.phone)}`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 text-white font-semibold shadow-md"
            >
              <Phone className="w-5 h-5" />
              Call Now: {contactInfo.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

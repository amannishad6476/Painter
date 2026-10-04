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

  // Dynamic classes for desktop navigation links based on scrolled and active state
  const getNavLinkClass = (isActive) => {
    if (!scrolled) {
      return isActive
        ? 'text-brand-300 bg-brand-500/20 border-brand-400/40 font-semibold shadow-sm'
        : 'text-slate-200 hover:text-white hover:bg-white/10 border-transparent';
    }
    return isActive
      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/15 border-brand-200/80 dark:border-brand-500/30 font-semibold shadow-sm'
      : 'text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border-transparent';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-md border-b border-slate-200/80 dark:border-slate-800/80 py-2.5' 
        : 'bg-slate-950/75 backdrop-blur-md border-b border-white/10 shadow-sm py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 xl:gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200 border border-white/20 dark:border-slate-700/60 bg-slate-900 flex-shrink-0 flex items-center justify-center">
            <img
              src="/assets/logo.png"
              alt="Munnalal Painter - House Painter & Wall Painting Services Lucknow Logo"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className={`text-base sm:text-lg xl:text-xl font-black tracking-tight leading-none flex items-center font-outfit transition-colors ${
              !scrolled ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}>
              Munnalal<span className="text-brand-500 ml-0.5">Painter</span>
            </span>
            <span className={`text-[9px] xl:text-[10px] font-semibold tracking-wider uppercase transition-colors leading-tight mt-0.5 ${
              !scrolled ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
            }`}>
              Pro Painting &amp; Waterproofing
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5">
          {navItems.map((item) => {
            if (item.isDropdown) {
              const isDropdownActive = activeTab === 'services' || activeTab.startsWith('service-');
              return (
                <div 
                  key={item.id} 
                  className="relative group"
                  onMouseEnter={() => setServicesDropdownOpen(true)}
                  onMouseLeave={() => setServicesDropdownOpen(false)}
                >
                  <button
                    onClick={() => handleNavClick('services')}
                    className={`inline-flex items-center justify-center gap-1 h-9 xl:h-10 px-2.5 xl:px-3 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap border ${getNavLinkClass(
                      isDropdownActive
                    )}`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {/* Dropdown Menu */}
                  <div 
                    className="absolute left-0 top-full pt-1.5 w-56 hidden group-hover:block z-50"
                  >
                    <div className="p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-0.5">
                      {servicePages.map(sp => (
                        <button
                          key={sp.slug}
                          onClick={() => handleServiceSelect(sp.slug)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <Layers className="w-3.5 h-3.5 text-brand-500 group-hover:text-white flex-shrink-0" />
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
                className={`inline-flex items-center justify-center h-9 xl:h-10 px-2.5 xl:px-3 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap border ${getNavLinkClass(
                  activeTab === item.id
                )}`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase transition-colors ${
                    !scrolled
                      ? 'bg-brand-500/25 text-brand-300 border border-brand-400/30'
                      : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons & Theme Switcher */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 flex-shrink-0">
          <button
            onClick={toggleDarkMode}
            className={`inline-flex items-center justify-center w-9 h-9 xl:w-10 xl:h-10 rounded-xl transition-colors border ${
              !scrolled
                ? 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700/80'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 xl:w-4.5 xl:h-4.5 text-amber-400" /> : <Moon className={`w-4 h-4 xl:w-4.5 xl:h-4.5 ${!scrolled ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`} />}
          </button>

          <a
            href={`tel:${cleanPhone(contactInfo.phone)}`}
            className="inline-flex items-center justify-center gap-1.5 xl:gap-2 h-9 xl:h-10 px-3 xl:px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold text-xs xl:text-sm shadow-md hover:shadow-brand-500/25 transition-all duration-200 whitespace-nowrap flex-shrink-0"
          >
            <Phone className="w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0" />
            <span>Call: {contactInfo.phone}</span>
          </a>
        </div>

        {/* Mobile & Tablet controls */}
        <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
          <a
            href={`tel:${cleanPhone(contactInfo.phone)}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-xs font-semibold shadow-sm whitespace-nowrap"
            aria-label="Call Munnalal Painter"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Now</span>
          </a>

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors border ${
              !scrolled
                ? 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className={`w-4 h-4 ${!scrolled ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition-colors border ${
              !scrolled
                ? 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
            }`}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-1.5 mt-2 shadow-2xl max-h-[80vh] overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors ${
                  activeTab === item.id
                    ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 font-bold border border-brand-200/60 dark:border-brand-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 uppercase">
                    {item.badge}
                  </span>
                )}
              </button>

              {item.isDropdown && (
                <div className="pl-3 pt-1 pb-1 space-y-1">
                  {servicePages.map(sp => (
                    <button
                      key={sp.slug}
                      onClick={() => handleServiceSelect(sp.slug)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400 flex items-center gap-2 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold text-sm shadow-md transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Now: {contactInfo.phone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

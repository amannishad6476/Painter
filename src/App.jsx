import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import ServicePage from './components/ServicePage';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import PriceEstimate from './components/PriceEstimate';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import FloatingCTA from './components/FloatingCTA';
import SEO from './components/SEO';
import { CMSProvider, useCMS } from './context/cmsContext';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [activeServicePage, setActiveServicePage] = useState(null);
  const { services } = useCMS();

  // Handle URL hash/path routing for deep linking service pages & sections
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;

      if (hash.startsWith('#/service/')) {
        const slug = hash.replace('#/service/', '');
        setActiveServicePage(slug);
      } else if (hash.startsWith('#')) {
        const tab = hash.replace('#', '');
        if (tab) {
          setActiveTab(tab);
          setActiveServicePage(null);
        }
      } else if (pathname !== '/' && pathname.length > 1) {
        const cleanPath = pathname.replace('/', '');
        if (['house-painting', 'interior-painting', 'exterior-painting', 'texture-painting', 'wall-putty', 'waterproofing', 'pop-design', 'wood-polish'].includes(cleanPath)) {
          setActiveServicePage(cleanPath);
        }
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    return () => window.removeEventListener('hashchange', handleLocationChange);
  }, []);

  // Check system dark mode preference or localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleSelectServiceForEstimate = (serviceTitle) => {
    setSelectedService(serviceTitle);
    setActiveServicePage(null);
    setActiveTab('pricing');
    window.location.hash = 'pricing';
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenServicePage = (slug) => {
    setActiveServicePage(slug);
    window.location.hash = `/service/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetEstimateClick = () => {
    setActiveServicePage(null);
    setActiveTab('pricing');
    window.location.hash = 'pricing';
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactClick = () => {
    setActiveServicePage(null);
    setActiveTab('contact');
    window.location.hash = 'contact';
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTabChange = (tabId) => {
    setActiveServicePage(null);
    setActiveTab(tabId);
    window.location.hash = tabId === 'home' ? '' : tabId;
    if (tabId === 'admin') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTimeout(() => {
        const el = document.getElementById(tabId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const currentServiceObj = services.find(s => 
    s.slug === activeServicePage || 
    s.title.toLowerCase().replace(/\s+/g, '-') === activeServicePage ||
    s.title.toLowerCase().includes((activeServicePage || '').replace(/-/g, ' '))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Dynamic SEO Meta & Title Manager */}
      <SEO
        activeTab={activeTab}
        activeServicePage={activeServicePage}
        service={currentServiceObj}
      />

      {/* Sticky Glass Navbar */}
      <Navbar
        activeTab={activeServicePage ? 'services' : activeTab}
        setActiveTab={handleTabChange}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenServicePage={handleOpenServicePage}
      />

      {/* Main Container */}
      <main>
        {activeTab === 'admin' ? (
          /* Separate Standalone Admin Dashboard View */
          <AdminPanel onBack={() => handleTabChange('home')} />
        ) : activeServicePage ? (
          /* Dedicated Service Page View */
          <ServicePage
            serviceSlug={activeServicePage}
            onBack={() => { setActiveServicePage(null); handleTabChange('services'); }}
            onNavigateContact={handleContactClick}
          />
        ) : (
          /* Standard Multi-Section View */
          <>
            {/* Home / Hero Section */}
            <Hero
              onGetEstimateClick={handleGetEstimateClick}
              onContactClick={handleContactClick}
            />

            {/* About Us Section */}
            <About />

            {/* Services Section */}
            <Services
              onSelectServiceForEstimate={handleSelectServiceForEstimate}
              onOpenServicePage={handleOpenServicePage}
            />

            {/* Gallery Section */}
            <Gallery />

            {/* Testimonials Section */}
            <Testimonials />

            {/* Price Estimate Calculator Section */}
            <PriceEstimate
              preselectedService={selectedService}
            />

            {/* Contact Section */}
            <Contact />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={handleTabChange} />

      {/* Floating CTA Buttons (WhatsApp, Call Now & Get Directions) */}
      <FloatingCTA />

    </div>
  );
}

function App() {
  return (
    <CMSProvider>
      <MainApp />
    </CMSProvider>
  );
}

export default App;

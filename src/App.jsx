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
import { CMSProvider } from './context/cmsContext';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [activeServicePage, setActiveServicePage] = useState(null);

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
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenServicePage = (slug) => {
    setActiveServicePage(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetEstimateClick = () => {
    setActiveServicePage(null);
    setActiveTab('pricing');
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactClick = () => {
    setActiveServicePage(null);
    setActiveTab('contact');
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTabChange = (tabId) => {
    setActiveServicePage(null);
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
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
        {activeServicePage ? (
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

            {/* Admin Dashboard Section */}
            <AdminPanel />
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

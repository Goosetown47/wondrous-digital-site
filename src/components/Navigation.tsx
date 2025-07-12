import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isFeatureRoute = location.pathname.startsWith('/features');

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 px-4 sm:px-[30px] py-6`}>
      <div className={`w-full max-w-[1280px] mx-auto transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-premium rounded-[25px] px-4 sm:px-8 py-4' 
          : 'px-4 sm:px-8 py-4'
      }`}>
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0" style={{ transform: 'translateY(5px)' }}>
            <Link to="/" onClick={scrollToTop} className="focus:outline-none">
              <img 
                src="/Logo_ Wondrous Digital.png" 
                alt="Wondrous Digital" 
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center space-x-12 absolute left-1/2 transform -translate-x-1/2">
            <Link 
              to="/features" 
              className={`hover:text-primary-pink transition-colors duration-200 font-medium ${
                isFeatureRoute ? 'text-primary-pink' : 'text-gray-700'
              }`}
            >
              Features
            </Link>
            <Link 
              to="/blog" 
              className={`hover:text-primary-pink transition-colors duration-200 font-medium ${
                location.pathname.startsWith('/blog') ? 'text-primary-pink' : 'text-gray-700'
              }`}
            >
              Blog
            </Link>
            <a href="#pricing" className="text-gray-700 hover:text-primary-pink transition-colors duration-200 font-medium">
              Pricing
            </a>
            <a href="#websites" className="text-gray-700 hover:text-primary-pink transition-colors duration-200 font-medium">
              Websites
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex">
            <Link to="/booking" className="bg-[#302940] text-white px-8 py-3 rounded-full font-semibold shadow-button-pink hover:shadow-button-pink-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-[#F666AB] uppercase tracking-wide text-sm">
              Book a Call
            </Link>
            <Link to="/login" className="bg-white text-primary-pink px-8 py-3 rounded-full font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-primary-dark-purple uppercase tracking-wide text-sm ml-3">
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-pink transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border border-gray-200 shadow-premium rounded-2xl mt-4 mx-4 w-[calc(100%-2rem)]">
          <div className="px-6 pt-4 pb-6 space-y-4">
            <Link 
              to="/features" 
              className={`block hover:text-primary-pink transition-colors duration-200 font-medium py-2 ${
                isFeatureRoute ? 'text-primary-pink' : 'text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/blog" 
              className={`block hover:text-primary-pink transition-colors duration-200 font-medium py-2 ${
                location.pathname.startsWith('/blog') ? 'text-primary-pink' : 'text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <a 
              href="#pricing" 
              className="block text-gray-700 hover:text-primary-pink transition-colors duration-200 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="#websites" 
              className="block text-gray-700 hover:text-primary-pink transition-colors duration-200 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Websites
            </a>
            <div className="pt-4 border-t border-gray-200">
              <Link to="/booking" className="w-full bg-[#302940] text-white px-8 py-3 rounded-full font-semibold shadow-button-pink hover:shadow-button-pink-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-[#F666AB] uppercase tracking-wide text-sm block text-center mb-3" onClick={() => setIsMenuOpen(false)}>
                Book a Call
              </Link>
              <Link to="/login" className="w-full bg-white text-primary-pink px-8 py-3 rounded-full font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-primary-dark-purple uppercase tracking-wide text-sm block text-center" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
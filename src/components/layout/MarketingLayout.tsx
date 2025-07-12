import React from 'react';
import { Outlet } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import Navigation from '../Navigation';
import Footer from '../Footer';

const MarketingLayout = () => {
  // Initialize scroll-to-top functionality for marketing pages
  useScrollToTop();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Outlet />
      <Footer />
    </div>
  );
};

export default MarketingLayout;
import React from 'react';
import Hero from '../components/Hero';
import ProductSummary from '../components/ProductSummary';
import FeaturesOverview from '../components/FeaturesOverview';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';

const HomePage = () => {
  return (
    <>
      <Hero />
      <ProductSummary />
      <FeaturesOverview />
      <Pricing />
      <FAQ />
    </>
  );
};

export default HomePage;
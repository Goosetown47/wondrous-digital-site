import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, BarChart3, ArrowRight } from 'lucide-react';

const OurPlatformsOverview = () => {
  const features = [
    {
      name: 'SEO Addon',
      slug: 'seo-addon',
      description: 'Comprehensive SEO package to boost your search rankings and organic traffic',
      benefit: 'Rank higher on Google and get found by more customers'
    },
    {
      name: 'SEO Dashboard',
      slug: 'seo-dashboard',
      description: 'Real-time SEO analytics, keyword tracking, and performance insights',
      benefit: 'Make data-driven decisions about your online presence'
    },
    {
      name: 'Marketing Dashboard',
      slug: 'marketing-dashboard',
      description: 'Unified view of all your marketing efforts and customer interactions',
      benefit: 'See the complete picture of your business growth'
    },
    {
      name: 'Our Mobile App',
      slug: 'our-mobile-app',
      description: 'Manage your business on-the-go with our powerful mobile application',
      benefit: 'Run your business from anywhere, anytime'
    }
  ];

  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white mr-4">
            <Settings className="h-8 w-8" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-display" style={{ color: 'rgb(31, 10, 66)' }}>
            Our Platforms
          </h1>
        </div>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Powerful dashboards and specialized tools that give you complete visibility and control 
          over your business growth. Everything you need to make informed decisions and scale effectively.
        </p>
      </div>

      {/* Key Benefits */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Platform Advantages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <BarChart3 className="h-6 w-6 text-indigo-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Unified Dashboard</h3>
              <p className="text-gray-600 text-sm">All your business metrics in one place. No more jumping between multiple tools.</p>
            </div>
          </div>
          <div className="flex items-start">
            <BarChart3 className="h-6 w-6 text-indigo-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Insights</h3>
              <p className="text-gray-600 text-sm">Live data updates so you always know what's happening with your business.</p>
            </div>
          </div>
          <div className="flex items-start">
            <BarChart3 className="h-6 w-6 text-indigo-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Mobile Access</h3>
              <p className="text-gray-600 text-sm">Manage your business from anywhere with our mobile-optimized platforms.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Platform Features</h2>
        {features.map((feature) => (
          <Link
            key={feature.slug}
            to={`/features/our-platforms/${feature.slug}`}
            className="group block"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-premium transition-all duration-300 hover:border-indigo-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm text-indigo-600">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></div>
                    {feature.benefit}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-200 ml-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Ready to Take Control of Your Business Growth?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Experience the power of having all your business data and tools in one place. 
          See how our platforms can transform how you run your business.
        </p>
        <button className="bg-white text-indigo-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-indigo-700 uppercase tracking-wide text-sm">
          Explore Our Platforms
        </button>
      </div>
    </div>
  );
};

export default OurPlatformsOverview;
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, ArrowRight } from 'lucide-react';

const MarketingSEOOverview = () => {
  const features = [
    {
      name: 'Local Search Visibility',
      slug: 'local-search-visibility',
      description: 'Optimize your presence for local searches and Google My Business',
      benefit: 'Show up when customers search nearby'
    },
    {
      name: 'Email Newsletters',
      slug: 'email-newsletters',
      description: 'Professional email campaigns that keep customers engaged and informed',
      benefit: 'Stay top-of-mind with regular touchpoints'
    },
    {
      name: 'Post to All Channels',
      slug: 'post-to-all-channels',
      description: 'Publish content across all social media platforms simultaneously',
      benefit: 'Maximum reach with minimal effort'
    },
    {
      name: 'Site Audits & Optimization',
      slug: 'site-audits-optimization',
      description: 'Regular website analysis and improvements for better performance',
      benefit: 'Faster loading, higher rankings'
    },
    {
      name: 'Keyword Rank Tracking',
      slug: 'keyword-rank-tracking',
      description: 'Monitor your search engine rankings for important keywords',
      benefit: 'Know where you stand vs competitors'
    },
    {
      name: 'SEO Reporting',
      slug: 'seo-reporting',
      description: 'Monthly reports showing your search visibility progress',
      benefit: 'Track growth and identify opportunities'
    },
    {
      name: 'SEO Dashboard',
      slug: 'seo-dashboard',
      description: 'Real-time analytics and SEO performance metrics',
      benefit: 'Make data-driven marketing decisions'
    }
  ];

  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white mr-4">
            <TrendingUp className="h-8 w-8" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-display" style={{ color: 'rgb(31, 10, 66)' }}>
            Marketing & SEO
          </h1>
        </div>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Boost your online visibility and attract more qualified customers through strategic marketing 
          and search engine optimization. Get found by people actively looking for your services.
        </p>
      </div>

      {/* Key Benefits */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why Marketing & SEO Matter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Target className="h-6 w-6 text-orange-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Qualified Traffic</h3>
              <p className="text-gray-600 text-sm">Attract people who are already looking for what you offer, not random visitors.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Target className="h-6 w-6 text-orange-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Long-term Growth</h3>
              <p className="text-gray-600 text-sm">SEO builds momentum over time. Rank higher today, get more customers tomorrow.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Target className="h-6 w-6 text-orange-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cost-Effective</h3>
              <p className="text-gray-600 text-sm">Organic traffic is free traffic. Invest once in SEO, benefit for years.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Marketing & SEO Tools</h2>
        {features.map((feature) => (
          <Link
            key={feature.slug}
            to={`/features/marketing-seo/${feature.slug}`}
            className="group block"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-premium transition-all duration-300 hover:border-orange-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm text-orange-600">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                    {feature.benefit}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-200 ml-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Ready to Boost Your Online Visibility?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          See how strategic marketing and SEO can bring qualified customers directly to your business. 
          Get found by people ready to buy.
        </p>
        <button className="bg-white text-orange-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-orange-700 uppercase tracking-wide text-sm">
          Boost My Visibility
        </button>
      </div>
    </div>
  );
};

export default MarketingSEOOverview;
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, CheckCircle, ArrowRight } from 'lucide-react';

const WebsitesOverview = () => {
  const features = [
    {
      name: 'Free Web Design',
      slug: 'free-web-design',
      description: 'Professional custom websites designed and built at no charge',
      benefit: 'Save $3,000-$15,000 in design costs'
    },
    {
      name: 'Custom Domains',
      slug: 'custom-domains',
      description: 'Your own branded web address that customers can easily remember',
      benefit: 'Professional credibility & easy to find'
    },
    {
      name: 'GDPR Compliance',
      slug: 'gdpr-compliance',
      description: 'Full compliance with international privacy regulations',
      benefit: 'Legal protection & customer trust'
    },
    {
      name: 'HTTPS Certification',
      slug: 'https-certification',
      description: 'Secure encrypted connections for all website visitors',
      benefit: 'Security & search engine ranking boost'
    },
    {
      name: 'Top Tier Web Hosting',
      slug: 'top-tier-web-hosting',
      description: 'Lightning-fast, reliable hosting with 99.9% uptime guarantee',
      benefit: 'Never lose customers to slow loading'
    },
    {
      name: 'Blogging',
      slug: 'blogging',
      description: 'Built-in blogging platform to share expertise and improve SEO',
      benefit: 'Attract more customers through content'
    }
  ];

  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white mr-4">
            <Globe className="h-8 w-8" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-display" style={{ color: 'rgb(31, 10, 66)' }}>
            Websites
          </h1>
        </div>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Every business needs a professional online presence. We build yours completely free - 
          a custom website with everything you need to look credible and convert visitors into customers.
        </p>
      </div>

      {/* Key Benefits */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why Professional Websites Matter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">First Impressions Count</h3>
              <p className="text-gray-600 text-sm">Visitors judge your business in 50 milliseconds. A professional website builds instant trust.</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Sales Tool</h3>
              <p className="text-gray-600 text-sm">Your website works around the clock, capturing leads and showcasing your services while you sleep.</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Competitive Advantage</h3>
              <p className="text-gray-600 text-sm">81% of customers research online before buying. Be there when they're looking.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display text-gray-900 mb-6">What's Included</h2>
        {features.map((feature) => (
          <Link
            key={feature.slug}
            to={`/features/websites/${feature.slug}`}
            className="group block"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-premium transition-all duration-300 hover:border-blue-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    {feature.benefit}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 ml-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Ready for Your Free Professional Website?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          See how a custom website can transform your business. Book a consultation 
          and we'll show you exactly what we'd build for you.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-blue-700 uppercase tracking-wide text-sm">
          Book Your Free Consultation
        </button>
      </div>
    </div>
  );
};

export default WebsitesOverview;
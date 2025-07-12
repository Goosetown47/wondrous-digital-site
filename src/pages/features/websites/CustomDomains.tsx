import React from 'react';
import { CheckCircle, ArrowRight, Globe, Shield, TrendingUp } from 'lucide-react';

const CustomDomains = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Custom Domains
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Get your own professional web address that customers can easily remember and trust. 
          No more generic website URLs - establish your brand with a custom domain.
        </p>
      </div>

      {/* Why Custom Domains Matter */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why Custom Domains Are Essential</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Credibility</h3>
              <p className="text-gray-600 text-sm">Customers trust yourcompany.com more than yourcompany.wix.com or generic URLs</p>
            </div>
          </div>
          <div className="flex items-start">
            <Globe className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy to Remember</h3>
              <p className="text-gray-600 text-sm">Simple, branded URLs are easier for customers to remember and share</p>
            </div>
          </div>
          <div className="flex items-start">
            <TrendingUp className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Better SEO</h3>
              <p className="text-gray-600 text-sm">Search engines prefer websites with their own domains over subdomain sites</p>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Options */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-8">Domain Options We Provide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">.com Domains</h3>
            <p className="text-gray-600 mb-4">
              The gold standard for business websites. Most trusted and recognized by customers worldwide.
            </p>
            <ul className="space-y-2">
              {[
                'Most professional and trusted extension',
                'Best for SEO and search rankings',
                'Easy for customers to remember',
                'Global recognition and credibility'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Alternative Extensions</h3>
            <p className="text-gray-600 mb-4">
              When .com isn't available, we'll help you choose the best alternative for your business.
            </p>
            <ul className="space-y-2">
              {[
                '.net - Great for tech and service businesses',
                '.org - Perfect for nonprofits and communities',
                '.biz - Business-focused alternative',
                'Local extensions like .us for American businesses'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">What's Included with Your Domain</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Domain registration and annual renewal',
            'Professional email addresses (info@yourcompany.com)',
            'DNS management and configuration',
            'Domain privacy protection included',
            'Easy domain forwarding and redirects',
            'Subdomain creation (blog.yourcompany.com)',
            '24/7 domain monitoring and security',
            'Free domain transfers if needed',
            'WHOIS privacy protection',
            'Email forwarding and aliases',
            'Technical support for domain issues',
            'Integration with your website and email'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Domain Selection Process */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">How We Choose Your Perfect Domain</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Business Name Priority</h3>
            <p className="text-gray-600">We first try to secure your exact business name with .com extension.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Keyword Optimization</h3>
            <p className="text-gray-600">If your business name isn't available, we suggest alternatives that include relevant keywords for better SEO.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Local Variations</h3>
            <p className="text-gray-600">For local businesses, we consider adding your city or region to the domain name.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Future-Proof Selection</h3>
            <p className="text-gray-600">We choose domains that will grow with your business and won't need changing as you expand.</p>
          </div>
        </div>
      </div>

      {/* Email Benefits */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Professional Email Addresses Included</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <p className="text-gray-700 mb-4">
            With your custom domain, you get professional email addresses that match your website:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm"><strong>Instead of:</strong> john.smith.business@gmail.com</p>
              <p className="text-sm"><strong>You get:</strong> john@yourcompany.com</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm"><strong>Common options:</strong></p>
              <ul className="text-sm space-y-1">
                <li>• info@yourcompany.com</li>
                <li>• sales@yourcompany.com</li>
                <li>• support@yourcompany.com</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Ready for Your Professional Domain?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop using generic website URLs. Get a custom domain that builds trust, 
          improves your SEO, and makes your business look professional.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-blue-700 uppercase tracking-wide text-sm inline-flex items-center">
          Get My Custom Domain
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CustomDomains;
import React from 'react';
import { CheckCircle, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

const TopTierWebHosting = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Top Tier Web Hosting
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Lightning-fast, enterprise-grade hosting that keeps your website running smoothly 24/7. 
          Never lose customers to slow loading times or website downtime again.
        </p>
      </div>

      {/* Why Hosting Matters */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why Quality Hosting Is Critical</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Zap className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Speed Affects Sales</h3>
              <p className="text-gray-600 text-sm">A 1-second delay in page load time can reduce conversions by 7%. Fast hosting = more customers.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Reliability Builds Trust</h3>
              <p className="text-gray-600 text-sm">When your website is down, customers question your business. 99.9% uptime keeps you professional.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Globe className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">SEO Rankings</h3>
              <p className="text-gray-600 text-sm">Google prioritizes fast websites. Quality hosting improves your search engine rankings.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hosting Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-8">What's Included with Your Hosting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Features</h3>
            <ul className="space-y-3">
              {[
                'Global CDN for worldwide fast loading',
                'SSD storage for lightning-fast data access',
                'Advanced caching for optimized performance',
                'HTTP/2 support for faster connections',
                'Image optimization and compression',
                'Lazy loading for improved speed'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Security & Reliability</h3>
            <ul className="space-y-3">
              {[
                '99.9% uptime guarantee with monitoring',
                'Daily automated backups included',
                'DDoS protection and security scanning',
                'SSL certificates for secure connections',
                'Firewall protection against threats',
                '24/7 server monitoring and support'
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

      {/* Performance Metrics */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Performance You Can Count On</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
            <p className="text-gray-600 font-medium">Uptime Guarantee</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">&lt;200ms</div>
            <p className="text-gray-600 font-medium">Average Load Time</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">Global</div>
            <p className="text-gray-600 font-medium">CDN Coverage</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-gray-600 font-medium">Monitoring</p>
          </div>
        </div>
      </div>

      {/* Hosting Infrastructure */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Enterprise-Grade Infrastructure</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cloud-Based Architecture</h3>
            <p className="text-gray-600">Your website runs on modern cloud infrastructure that automatically scales with traffic spikes and provides redundancy across multiple data centers.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Edge Locations Worldwide</h3>
            <p className="text-gray-600">Content is served from the location closest to your visitors, ensuring fast loading times whether they're across town or across the globe.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatic Scaling</h3>
            <p className="text-gray-600">During traffic surges (like viral social media posts or busy seasons), your hosting automatically scales to handle the load without slowdowns.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Green Hosting</h3>
            <p className="text-gray-600">Our hosting infrastructure is powered by renewable energy sources, making your website environmentally responsible.</p>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">How We Compare to Other Hosting</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Typical Shared Hosting</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 3-5 second load times</li>
                <li>• 95-98% uptime (hours of downtime monthly)</li>
                <li>• Basic security measures</li>
                <li>• Limited support hours</li>
                <li>• Shared resources with hundreds of sites</li>
                <li>• Manual updates and maintenance</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Top Tier Hosting</h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Sub-200ms load times</li>
                <li>• 99.9% uptime guarantee</li>
                <li>• Enterprise-grade security</li>
                <li>• 24/7 monitoring and support</li>
                <li>• Dedicated resources and CDN</li>
                <li>• Automatic updates and optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Ready for Lightning-Fast Hosting?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop losing customers to slow websites. Get enterprise-grade hosting that keeps your site 
          fast and online 24/7, included free with every website we build.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-blue-700 uppercase tracking-wide text-sm inline-flex items-center">
          Upgrade My Hosting
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TopTierWebHosting;
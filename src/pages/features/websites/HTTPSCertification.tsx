import React from 'react';
import { CheckCircle, ArrowRight, Shield, Lock, TrendingUp } from 'lucide-react';

const HTTPSCertification = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          HTTPS Certification
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Secure your website with industry-standard SSL encryption. Every website we build includes 
          free HTTPS certification for maximum security and search engine optimization benefits.
        </p>
      </div>

      {/* Why HTTPS Matters */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why HTTPS is Essential</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
              <p className="text-gray-600 text-sm">All information between your website and visitors is encrypted and secure</p>
            </div>
          </div>
          <div className="flex items-start">
            <TrendingUp className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">SEO Benefits</h3>
              <p className="text-gray-600 text-sm">Google favors HTTPS websites in search rankings</p>
            </div>
          </div>
          <div className="flex items-start">
            <Lock className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Customer Trust</h3>
              <p className="text-gray-600 text-sm">The green padlock icon builds confidence in your business</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-8">Security Features Included</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">SSL/TLS Encryption</h3>
            <p className="text-gray-600 mb-4">
              Military-grade encryption protects all data transmitted between your website and visitors.
            </p>
            <ul className="space-y-2">
              {[
                '256-bit SSL encryption',
                'Automatic certificate renewal',
                'Multiple domain support',
                'Wildcard SSL for subdomains'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Security</h3>
            <p className="text-gray-600 mb-4">
              Beyond basic HTTPS, we implement additional security measures to protect your website.
            </p>
            <ul className="space-y-2">
              {[
                'Firewall protection',
                'DDoS attack prevention',
                'Malware scanning and removal',
                'Security headers optimization'
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

      {/* Browser Benefits */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">How HTTPS Improves User Experience</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Green padlock icon shows visitors your site is secure',
            'No browser warnings about unsecured connections',
            'Faster loading speeds with HTTP/2 protocol',
            'Required for modern web features like geolocation',
            'Enables service workers for offline functionality',
            'Necessary for payment processing and forms',
            'Protects against man-in-the-middle attacks',
            'Ensures data integrity during transmission',
            'Builds customer confidence and trust',
            'Prevents ISP injection of ads or content',
            'Required for PWA (Progressive Web App) features',
            'Improves conversion rates through trust signals'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SEO Impact */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">HTTPS SEO Benefits</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Ranking Factor</h3>
            <p className="text-gray-600">Google has confirmed that HTTPS is a ranking signal. Secure sites rank higher than non-secure ones.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Referrer Data Protection</h3>
            <p className="text-gray-600">HTTPS preserves referrer data in analytics, giving you better insights into your traffic sources.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chrome Requirements</h3>
            <p className="text-gray-600">Chrome marks non-HTTPS sites as "Not Secure," which can significantly impact user trust and conversions.</p>
          </div>
        </div>
      </div>

      {/* Certificate Management */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Automatic Certificate Management</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <p className="text-gray-700 mb-4">
            We handle all the technical aspects of SSL certificate management so you don't have to worry about it:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Automatic Setup</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Certificate installation during website launch</li>
                <li>• Domain validation and verification</li>
                <li>• Server configuration optimization</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Ongoing Maintenance</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Automatic renewal before expiration</li>
                <li>• 24/7 monitoring and alerts</li>
                <li>• Updates for security improvements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Building Customer Trust</h2>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <p className="text-gray-700 mb-4">
            HTTPS certification provides visible trust indicators that reassure your customers:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Padlock Icon</h4>
              <p className="text-sm text-gray-600">Visible security indicator in browser address bar</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Certificate Info</h4>
              <p className="text-sm text-gray-600">Detailed certificate information available to users</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Verified Identity</h4>
              <p className="text-sm text-gray-600">Proof of website authenticity and ownership</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Secure Your Website Today
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Don't let security concerns hold back your business. Get HTTPS certification 
          included free with every website we build.
        </p>
        <button className="bg-white text-green-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-green-700 uppercase tracking-wide text-sm inline-flex items-center">
          Get Secure Website
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default HTTPSCertification;
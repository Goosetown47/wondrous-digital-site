import React from 'react';
import { CheckCircle, ArrowRight, Shield, Globe, Lock } from 'lucide-react';

const GDPRCompliance = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          GDPR Compliance
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Full compliance with the General Data Protection Regulation (GDPR) and international privacy laws. 
          Protect your business legally while building customer trust through transparent data practices.
        </p>
      </div>

      {/* Why GDPR Matters */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why GDPR Compliance Is Essential</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Legal Protection</h3>
              <p className="text-gray-600 text-sm">Avoid hefty fines up to €20 million or 4% of annual revenue for non-compliance</p>
            </div>
          </div>
          <div className="flex items-start">
            <Globe className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Global Reach</h3>
              <p className="text-gray-600 text-sm">GDPR applies to any business processing EU residents' data, regardless of location</p>
            </div>
          </div>
          <div className="flex items-start">
            <Lock className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Customer Trust</h3>
              <p className="text-gray-600 text-sm">Transparent privacy practices build confidence and credibility with customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* GDPR Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Our GDPR Compliance Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Cookie consent banners and management',
            'Privacy policy generation and updates',
            'Data processing documentation',
            'User consent tracking and records',
            'Right to be forgotten implementation',
            'Data portability features',
            'Breach notification procedures',
            'Data protection impact assessments',
            'Secure data storage and encryption',
            'Third-party vendor compliance monitoring',
            'Regular compliance audits and updates',
            'Staff training on data protection'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Process */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Our GDPR Implementation Process</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Data Audit</h3>
            <p className="text-gray-600">We identify all personal data your website collects and how it's processed.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Legal Documentation</h3>
            <p className="text-gray-600">Create compliant privacy policies, cookie policies, and terms of service.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Technical Implementation</h3>
            <p className="text-gray-600">Install consent management tools, secure data storage, and user rights features.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Ongoing Monitoring</h3>
            <p className="text-gray-600">Regular compliance checks and updates as regulations evolve.</p>
          </div>
        </div>
      </div>

      {/* Key Requirements */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Key GDPR Requirements We Handle</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">User Rights</h3>
            <ul className="space-y-2">
              {[
                'Right to access personal data',
                'Right to rectification (corrections)',
                'Right to erasure (be forgotten)',
                'Right to data portability',
                'Right to object to processing'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Obligations</h3>
            <ul className="space-y-2">
              {[
                'Lawful basis for data processing',
                'Clear consent mechanisms',
                'Data minimization principles',
                'Security measures and encryption',
                'Breach notification within 72 hours'
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

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Protect Your Business with GDPR Compliance
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Don't risk massive fines or lose customer trust. Get fully compliant with GDPR 
          and other privacy regulations from day one.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-blue-700 uppercase tracking-wide text-sm inline-flex items-center">
          Ensure GDPR Compliance
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default GDPRCompliance;
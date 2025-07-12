import React from 'react';
import { CheckCircle, ArrowRight, Palette, Code, Smartphone } from 'lucide-react';

const FreeWebDesign = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Free Web Design
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          We design and build professional, custom websites at absolutely no charge. 
          Get the same quality design that other agencies charge $3,000-$15,000 for - completely free.
        </p>
      </div>

      {/* Value Proposition */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why We Build Websites for Free</h2>
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            We make money from the monthly marketing services that bring you customers 24/7, not from building websites. 
            Thanks to modern AI tools and our 20 years of design experience, what used to take weeks now takes hours.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The free website proves we mean business. The monthly systems transform yours.
          </p>
        </div>
      </div>

      {/* Design Process */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-8">Our Design Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Palette className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Discovery & Design</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We learn about your business, brand, and goals. Then create a custom design using your colors, 
              logo, and content that speaks to your target customers.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Code className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Development</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We build your website with modern code (React, Tailwind, Vite) that loads fast, 
              looks professional, and works perfectly on all devices.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Launch & Optimize</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your website goes live within 48-72 hours. We include 2 rounds of revisions 
              to ensure you're completely happy with the result.
            </p>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">What's Included in Your Free Website</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Custom design using your branding and colors',
            'Professional content writing and optimization',
            'Mobile-responsive design that works on all devices',
            'Fast loading speeds for better user experience',
            'Contact forms that capture leads automatically',
            'Google Analytics integration for tracking',
            'Search engine optimization (SEO) basics',
            'Social media integration and links',
            'Professional hosting and security',
            'SSL certificate for secure connections',
            '2 rounds of design revisions included',
            'Training on how to make basic updates'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Design Philosophy */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Our Design Philosophy</h2>
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            <strong>Simple beats complex:</strong> Working at Amazon taught us that the highest-converting websites 
            have 40% fewer elements. Visitors judge sites in 50 milliseconds, so we focus on clarity and speed.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>Function over form:</strong> A beautiful website without customers is just an expensive business card. 
            We design for conversion, not just aesthetics.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>Proven building blocks:</strong> We use templates and layouts that we know work, 
            customized with your unique branding and content.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Timeline</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">1</div>
            <div>
              <h3 className="font-semibold text-gray-900">Day 1: Onboarding</h3>
              <p className="text-gray-600 text-sm">Complete our questionnaire with your business details, preferences, and goals</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">2</div>
            <div>
              <h3 className="font-semibold text-gray-900">Days 2-3: Design & Build</h3>
              <p className="text-gray-600 text-sm">We create your custom website design and build it with modern technology</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">3</div>
            <div>
              <h3 className="font-semibold text-gray-900">Day 3: Launch</h3>
              <p className="text-gray-600 text-sm">Your website goes live and we send you the link for review</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">4</div>
            <div>
              <h3 className="font-semibold text-gray-900">Week 1-2: Revisions</h3>
              <p className="text-gray-600 text-sm">Two rounds of revisions to perfect your website before finalizing</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Ready for Your Free Professional Website?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Join hundreds of businesses who've gotten professional websites at no charge. 
          See what we'd build for your business in a free consultation.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-blue-700 uppercase tracking-wide text-sm inline-flex items-center">
          Get My Free Website
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default FreeWebDesign;
import React from 'react';
import { CheckCircle, ArrowRight, Share2, Target, Repeat } from 'lucide-react';

const MultiChannelDripSystems = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Multi-Channel Drip Systems
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Coordinated messaging across text, email, social media, and direct mail to stay top-of-mind 
          with customers. Strategic touchpoints that guide prospects through your sales funnel automatically.
        </p>
      </div>

      {/* Why Multi-Channel Matters */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">The Multi-Channel Advantage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Share2 className="h-6 w-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Reach Everywhere</h3>
              <p className="text-gray-600 text-sm">Meet customers where they are - email, text, social media, and mail</p>
            </div>
          </div>
          <div className="flex items-start">
            <Target className="h-6 w-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Higher Conversion</h3>
              <p className="text-gray-600 text-sm">Multi-channel campaigns see 287% higher purchase rates than single-channel</p>
            </div>
          </div>
          <div className="flex items-start">
            <Repeat className="h-6 w-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consistent Messaging</h3>
              <p className="text-gray-600 text-sm">Coordinated touchpoints reinforce your message and build trust</p>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Types */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Communication Channels We Coordinate</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'SMS text messaging for immediate impact',
            'Email campaigns with rich content and images',
            'Social media posts and direct messages',
            'LinkedIn outreach for B2B prospects',
            'Facebook and Instagram messaging',
            'WhatsApp for international customers',
            'Voice calls and voicemails',
            'Direct mail for high-value prospects',
            'Push notifications through your app',
            'Retargeting ads on social platforms',
            'Google Ads remarketing campaigns',
            'Postal mail for special occasions'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Examples */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Multi-Channel Campaign Examples</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">New Customer Welcome Series</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Week 1: Introduction</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Day 1: Welcome email with getting started guide</li>
                  <li>• Day 2: SMS with quick tip and contact info</li>
                  <li>• Day 5: Social media connection request</li>
                  <li>• Day 7: Follow-up email checking satisfaction</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Week 2-4: Value Building</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Educational email content weekly</li>
                  <li>• SMS tips and tricks every few days</li>
                  <li>• Social media engagement and shares</li>
                  <li>• Special offer via preferred channel</li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Lead Nurture Campaign</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Immediate Response</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• SMS confirmation within 5 minutes</li>
                  <li>• Email with detailed information</li>
                  <li>• LinkedIn connection if B2B</li>
                  <li>• Retargeting ad campaign activated</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Follow-up Sequence</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Day 3: Case study via email</li>
                  <li>• Day 7: SMS check-in message</li>
                  <li>• Day 14: Social proof via email</li>
                  <li>• Day 21: Limited time offer across all channels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Optimization */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Smart Channel Selection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Preferences</h3>
            <ul className="space-y-2">
              {[
                'Track which channels customers respond to most',
                'Automatically adjust frequency by channel',
                'Honor opt-out preferences per channel',
                'Time messages for optimal engagement',
                'Personalize content by channel preference'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Message Coordination</h3>
            <ul className="space-y-2">
              {[
                'Consistent branding across all channels',
                'Complementary messages that build on each other',
                'Avoid overwhelming customers with too many touches',
                'Smart scheduling to prevent channel conflicts',
                'A/B testing to optimize message effectiveness'
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
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Multi-Channel Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">287%</div>
            <p className="text-gray-600 font-medium">Higher Purchase Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">80%</div>
            <p className="text-gray-600 font-medium">Increase in Touchpoints</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">35%</div>
            <p className="text-gray-600 font-medium">Better Engagement</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">24x</div>
            <p className="text-gray-600 font-medium">Higher ROI vs Single Channel</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Maximize Your Marketing Impact
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop relying on single-channel communication. Create coordinated campaigns 
          that reach customers everywhere and convert at higher rates.
        </p>
        <button className="bg-white text-orange-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-orange-700 uppercase tracking-wide text-sm inline-flex items-center">
          Launch Multi-Channel Campaigns
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MultiChannelDripSystems;
import React from 'react';
import { CheckCircle, ArrowRight, Share2, Clock, Target } from 'lucide-react';

const PostToAllChannels = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Post to All Channels
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Publish content across all social media platforms simultaneously. 
          Maximize your reach with minimal effort and maintain consistent presence everywhere your customers are.
        </p>
      </div>

      {/* Why Multi-Channel Posting Matters */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Maximize Your Social Media Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Share2 className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Wider Reach</h3>
              <p className="text-gray-600 text-sm">Your customers are on different platforms - reach them all with one post</p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Time Efficiency</h3>
              <p className="text-gray-600 text-sm">Save hours by posting once instead of logging into each platform separately</p>
            </div>
          </div>
          <div className="flex items-start">
            <Target className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consistent Presence</h3>
              <p className="text-gray-600 text-sm">Maintain active presence across all platforms without the management overhead</p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Platforms */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Supported Social Media Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Facebook business pages and personal profiles',
            'Instagram posts and stories',
            'Twitter/X for real-time updates',
            'LinkedIn for professional networking',
            'Google My Business posts',
            'YouTube community posts',
            'TikTok for video content',
            'Pinterest for visual content',
            'Nextdoor for local community engagement',
            'Yelp business updates',
            'WhatsApp Business status updates',
            'Telegram channels and groups'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Posting Features */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Intelligent Multi-Platform Posting</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Optimization</h3>
            <p className="text-gray-600">Automatically adapts your content for each platform's best practices. Long-form content for LinkedIn, hashtag optimization for Instagram, character limits for Twitter.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimal Timing</h3>
            <p className="text-gray-600">Posts are scheduled for when your audience is most active on each platform. Facebook at 9 AM, Instagram at 11 AM, LinkedIn at 8 AM - all automatically.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Adaptation</h3>
            <p className="text-gray-600">One piece of content becomes multiple platform-specific posts. A project photo becomes a LinkedIn case study, Instagram story, and Facebook update.</p>
          </div>
        </div>
      </div>

      {/* Content Types */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Content Types We Handle</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Updates</h3>
            <ul className="space-y-2">
              {[
                'New service announcements',
                'Team member introductions',
                'Behind-the-scenes content',
                'Company milestones and achievements',
                'Customer success stories'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Promotional Content</h3>
            <ul className="space-y-2">
              {[
                'Special offers and discounts',
                'Seasonal promotions',
                'Limited-time deals',
                'New product launches',
                'Event announcements'
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

      {/* Scheduling & Automation */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Advanced Scheduling Features</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Calendar</h3>
            <p className="text-gray-600">Plan and schedule posts weeks or months in advance. See your entire content strategy at a glance and ensure consistent posting.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bulk Scheduling</h3>
            <p className="text-gray-600">Upload multiple posts at once and schedule them across different platforms and time slots. Perfect for planning seasonal campaigns.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto-Posting</h3>
            <p className="text-gray-600">Set up recurring posts for regular content like weekly tips, monthly newsletters, or daily motivational quotes.</p>
          </div>
        </div>
      </div>

      {/* Platform-Specific Optimization */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Platform-Specific Optimization</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Facebook</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Longer captions with storytelling</li>
              <li>• Multiple image carousels</li>
              <li>• Event creation and promotion</li>
              <li>• Community engagement focus</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Instagram</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• High-quality visual content</li>
              <li>• Strategic hashtag usage</li>
              <li>• Stories and Reels creation</li>
              <li>• Visual brand consistency</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">LinkedIn</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Professional tone and insights</li>
              <li>• Industry expertise sharing</li>
              <li>• Business achievement highlights</li>
              <li>• Networking and partnerships</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Analytics & Performance */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Cross-Platform Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Unified Reporting</h3>
            <ul className="space-y-2">
              {[
                'Combined reach and engagement across all platforms',
                'Best performing content identification',
                'Optimal posting time analysis',
                'Audience growth tracking',
                'Click-through rates and conversions'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Insights</h3>
            <ul className="space-y-2">
              {[
                'Platform-specific performance comparisons',
                'Content type effectiveness analysis',
                'Audience demographic insights',
                'Engagement trend tracking',
                'ROI measurement and attribution'
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

      {/* Results */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Multi-Channel Posting Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">300%</div>
            <p className="text-gray-600 font-medium">Increase in Reach</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">75%</div>
            <p className="text-gray-600 font-medium">Time Saved</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">150%</div>
            <p className="text-gray-600 font-medium">More Engagement</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">5x</div>
            <p className="text-gray-600 font-medium">Posting Consistency</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Amplify Your Social Media Presence
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop spending hours managing multiple social media accounts. Post once 
          and reach your entire audience across all platforms automatically.
        </p>
        <button className="bg-white text-purple-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-purple-700 uppercase tracking-wide text-sm inline-flex items-center">
          Start Multi-Channel Posting
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PostToAllChannels;
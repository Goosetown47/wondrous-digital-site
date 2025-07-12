import React from 'react';
import { CheckCircle, ArrowRight, MessageSquare, Mail, Clock } from 'lucide-react';

const SMSEmailFollowups = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          SMS & Email Follow-ups
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Automatic text and email sequences that nurture leads, keep customers engaged, 
          and turn one-time visitors into loyal customers - all while you focus on running your business.
        </p>
      </div>

      {/* Why Follow-up Matters */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">The Power of Consistent Follow-up</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Speed Wins</h3>
              <p className="text-gray-600 text-sm">You're 8x more likely to convert leads when you follow up within 5 minutes</p>
            </div>
          </div>
          <div className="flex items-start">
            <MessageSquare className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Higher Open Rates</h3>
              <p className="text-gray-600 text-sm">SMS has a 98% open rate compared to 20% for email</p>
            </div>
          </div>
          <div className="flex items-start">
            <Mail className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Nurture Relationships</h3>
              <p className="text-gray-600 text-sm">80% of sales require 5 follow-up attempts after initial contact</p>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up Types */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Automated Follow-up Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'New lead welcome sequences',
            'Missed call instant follow-ups',
            'Appointment confirmation and reminders',
            'Post-service thank you messages',
            'Birthday and anniversary greetings',
            'Seasonal promotions and offers',
            'Review request campaigns',
            'Re-engagement sequences for inactive customers',
            'Educational content series',
            'Emergency or urgent notifications',
            'Loyalty program updates',
            'Referral request campaigns'
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
        <h2 className="text-2xl font-display text-gray-900 mb-6">Sample Follow-up Campaigns</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">New Lead Nurture Sequence</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Immediate:</strong> "Thanks for your interest! We'll be in touch within the hour."</p>
              <p><strong>1 hour:</strong> Personal call attempt + "Tried calling you - when's a good time to chat?"</p>
              <p><strong>1 day:</strong> "Here's how we've helped similar businesses like yours..."</p>
              <p><strong>3 days:</strong> "Still interested? Here's a quick case study..."</p>
              <p><strong>1 week:</strong> "Last check-in - here's a special offer for this week..."</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Reminder Sequence</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Booking:</strong> "Great! Your appointment is confirmed for [date] at [time]."</p>
              <p><strong>24 hours before:</strong> "Reminder: Your appointment is tomorrow at [time]. Looking forward to seeing you!"</p>
              <p><strong>2 hours before:</strong> "Your appointment starts in 2 hours. Here's our address and parking info..."</p>
              <p><strong>After service:</strong> "Thanks for choosing us! How was your experience?"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personalization */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Smart Personalization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Dynamic Content</h3>
            <ul className="space-y-2">
              {[
                'Customer name and personal details',
                'Service or product they inquired about',
                'Previous purchase history',
                'Location-specific information',
                'Timing based on their time zone'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Behavior-Based Triggers</h3>
            <ul className="space-y-2">
              {[
                'Website page visits and time spent',
                'Email open and click tracking',
                'Appointment booking or cancellation',
                'Purchase completion or abandonment',
                'Social media engagement'
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

      {/* Results & Analytics */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Track Your Success</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">70%</div>
            <p className="text-gray-600 font-medium">Missed Call Conversion Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">45%</div>
            <p className="text-gray-600 font-medium">Appointment Show Rate Increase</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">3x</div>
            <p className="text-gray-600 font-medium">Customer Engagement</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
            <p className="text-gray-600 font-medium">Revenue Increase</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Start Converting More Leads Automatically
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Never let another potential customer slip away. Set up automated follow-ups 
          that work 24/7 to nurture leads and grow your business.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-blue-700 uppercase tracking-wide text-sm inline-flex items-center">
          Set Up My Follow-ups
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SMSEmailFollowups;
import React from 'react';
import { CheckCircle, ArrowRight, Mail, Users, TrendingUp } from 'lucide-react';

const EmailNewsletters = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Email Newsletters
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Professional email campaigns that keep customers engaged and informed. 
          Stay top-of-mind with regular touchpoints that build relationships and drive repeat business.
        </p>
      </div>

      {/* Why Email Marketing Matters */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">The Power of Email Marketing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Mail className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">High ROI</h3>
              <p className="text-gray-600 text-sm">Email marketing returns $42 for every $1 spent - the highest ROI of any marketing channel</p>
            </div>
          </div>
          <div className="flex items-start">
            <Users className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Direct Access</h3>
              <p className="text-gray-600 text-sm">Reach customers directly in their inbox without algorithm interference</p>
            </div>
          </div>
          <div className="flex items-start">
            <TrendingUp className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Relationship Building</h3>
              <p className="text-gray-600 text-sm">Regular communication builds trust and keeps your business top-of-mind</p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Types */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Professional Newsletter Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Monthly business updates and news',
            'Seasonal promotions and special offers',
            'Educational content and tips',
            'Customer success stories and testimonials',
            'New service announcements',
            'Industry insights and trends',
            'Behind-the-scenes company updates',
            'Event invitations and announcements',
            'Maintenance reminders and tips',
            'Holiday greetings and special messages',
            'Referral program promotions',
            'Exclusive subscriber-only content'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Examples */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Sample Newsletter Content</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Monthly Business Update</h3>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Subject: "What's New at [Business Name] This Month"</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Welcome message from owner</li>
                <li>• New team member introductions</li>
                <li>• Recent project highlights</li>
                <li>• Customer spotlight</li>
                <li>• Upcoming promotions preview</li>
                <li>• Helpful tips related to your services</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Seasonal Promotion</h3>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Subject: "Spring Special: 20% Off HVAC Tune-ups"</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Eye-catching promotion announcement</li>
                <li>• Benefits of seasonal maintenance</li>
                <li>• Limited-time offer details</li>
                <li>• Easy booking call-to-action</li>
                <li>• Customer testimonials</li>
                <li>• Social proof and urgency</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Design & Content */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Professional Design & Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Custom Design</h3>
            <ul className="space-y-2">
              {[
                'Branded templates matching your website',
                'Mobile-responsive design for all devices',
                'Professional layout and typography',
                'High-quality images and graphics',
                'Consistent color scheme and branding'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Engaging Content</h3>
            <ul className="space-y-2">
              {[
                'Compelling subject lines that get opened',
                'Valuable content that readers appreciate',
                'Clear calls-to-action that drive results',
                'Personal tone that builds relationships',
                'Scannable format for busy readers'
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

      {/* Automation Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Smart Email Automation</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Scheduling</h3>
            <p className="text-gray-600">Set up newsletters to send automatically on your preferred schedule. Monthly updates, seasonal promotions, and special announcements go out without manual effort.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">List Segmentation</h3>
            <p className="text-gray-600">Send targeted content to different customer groups. New customers get welcome series, VIP customers get exclusive offers, and service customers get maintenance reminders.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalization</h3>
            <p className="text-gray-600">Every email includes the recipient's name and can reference their service history, location, or preferences for a personal touch.</p>
          </div>
        </div>
      </div>

      {/* Performance Tracking */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Email Performance Analytics</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Metrics We Track</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Engagement Metrics</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Open rates and click-through rates</li>
                  <li>• Time spent reading emails</li>
                  <li>• Forward and share rates</li>
                  <li>• Unsubscribe and bounce rates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Business Impact</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Appointments booked from emails</li>
                  <li>• Revenue generated per campaign</li>
                  <li>• Customer lifetime value increase</li>
                  <li>• Referrals generated from newsletters</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List Building */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Growing Your Email List</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Website Integration</h3>
            <p className="text-gray-600 text-sm">Signup forms on your website capture visitors and convert them to subscribers</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Customer Onboarding</h3>
            <p className="text-gray-600 text-sm">New customers automatically join your newsletter list with permission</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Lead Magnets</h3>
            <p className="text-gray-600 text-sm">Offer valuable content in exchange for email addresses to grow your list</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Email Newsletter Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">25%</div>
            <p className="text-gray-600 font-medium">Average Open Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">4.2%</div>
            <p className="text-gray-600 font-medium">Click-Through Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">15%</div>
            <p className="text-gray-600 font-medium">Revenue Increase</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">$42</div>
            <p className="text-gray-600 font-medium">ROI per $1 Spent</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Start Building Customer Relationships
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop hoping customers remember you. Send professional newsletters that keep your 
          business top-of-mind and drive repeat business automatically.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-blue-700 uppercase tracking-wide text-sm inline-flex items-center">
          Launch My Newsletter
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default EmailNewsletters;
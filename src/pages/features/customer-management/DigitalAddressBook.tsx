import React from 'react';
import { CheckCircle, ArrowRight, Users, Database, Search } from 'lucide-react';

const DigitalAddressBook = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Digital Address Book (CRM)
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Complete customer profiles with contact history, preferences, and interaction tracking. 
          Know your customers better than they know themselves and provide personalized service every time.
        </p>
      </div>

      {/* Why CRM Matters */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why Customer Data Is Your Business Goldmine</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Users className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Personal Service</h3>
              <p className="text-gray-600 text-sm">Remember every customer's preferences, history, and special requirements</p>
            </div>
          </div>
          <div className="flex items-start">
            <Database className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Organized Growth</h3>
              <p className="text-gray-600 text-sm">Track interactions and never lose important customer information again</p>
            </div>
          </div>
          <div className="flex items-start">
            <Search className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Insights</h3>
              <p className="text-gray-600 text-sm">Identify your best customers and opportunities for more business</p>
            </div>
          </div>
        </div>
      </div>

      {/* CRM Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Complete Customer Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Contact information with multiple numbers and emails',
            'Service history and past appointments',
            'Communication preferences (text vs email vs call)',
            'Important dates (birthdays, anniversaries)',
            'Custom notes and special requirements',
            'Lead source tracking and attribution',
            'Customer lifetime value calculations',
            'Family member and household information',
            'Property or business details for service companies',
            'Payment history and billing preferences',
            'Referral tracking and rewards management',
            'Social media profiles and connections'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Journey Tracking */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Track Every Customer Interaction</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Communication History</h3>
            <p className="text-gray-600">See every call, text, email, and in-person interaction in chronological order. Never ask "What did we talk about last time?" again.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Timeline</h3>
            <p className="text-gray-600">Track all services provided, when they were done, who did them, and any follow-up required. Perfect for warranty tracking and maintenance schedules.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Behavior</h3>
            <p className="text-gray-600">Understand buying patterns, seasonal preferences, and average purchase values to predict future needs and optimize your offerings.</p>
          </div>
        </div>
      </div>

      {/* Smart Organization */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Smart Customer Organization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Automatic Tagging</h3>
            <ul className="space-y-2">
              {[
                'Service type categories (plumbing, electrical, etc.)',
                'Customer value levels (bronze, silver, gold, VIP)',
                'Lead sources (website, referral, Google, etc.)',
                'Geographic locations for service areas',
                'Communication preferences and optimal contact times'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Lists & Segments</h3>
            <ul className="space-y-2">
              {[
                'High-value customers for special attention',
                'Customers due for annual services',
                'Recent customers for review requests',
                'Inactive customers for win-back campaigns',
                'Referral candidates who love your service'
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

      {/* Business Intelligence */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Business Intelligence Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Customer Analytics</h3>
            <p className="text-gray-600 text-sm">See customer lifetime value, repeat purchase rates, and churn indicators</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Revenue Tracking</h3>
            <p className="text-gray-600 text-sm">Track revenue per customer, service profitability, and growth trends</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Opportunity Finder</h3>
            <p className="text-gray-600 text-sm">Identify upsell opportunities and customers ready for additional services</p>
          </div>
        </div>
      </div>

      {/* Integration Benefits */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Seamless Integration</h2>
        <div className="space-y-4">
          <p className="text-gray-700">Your CRM integrates with every other tool in your business ecosystem:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Automatic Data Entry</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Website form submissions</li>
                <li>• Phone call logs and recordings</li>
                <li>• Email interactions and responses</li>
                <li>• Text message conversations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Connected Systems</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Calendar for appointment scheduling</li>
                <li>• Email marketing for campaigns</li>
                <li>• Invoicing and payment processing</li>
                <li>• Social media for profile enrichment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Know Your Customers Like Never Before
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop relying on memory and scattered notes. Get a complete customer database 
          that helps you provide amazing service and grow your business.
        </p>
        <button className="bg-white text-green-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-green-700 uppercase tracking-wide text-sm inline-flex items-center">
          Organize My Customers
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DigitalAddressBook;
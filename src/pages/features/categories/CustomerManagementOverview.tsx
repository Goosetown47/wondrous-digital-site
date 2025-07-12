import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, ArrowRight } from 'lucide-react';

const CustomerManagementOverview = () => {
  const features = [
    {
      name: 'Digital Address Book (CRM)',
      slug: 'digital-address-book',
      description: 'Complete customer profiles with contact history, preferences, and interaction tracking',
      benefit: 'Know your customers better than they know themselves'
    },
    {
      name: 'Online Booking Calendar',
      slug: 'online-booking-calendar',
      description: 'Let customers book appointments 24/7 with automatic confirmations and reminders',
      benefit: 'Fill your calendar while you sleep'
    },
    {
      name: 'Smart Contact Forms',
      slug: 'smart-contact-forms',
      description: 'Intelligent forms that capture leads and automatically add them to your CRM',
      benefit: 'Every website visitor becomes a trackable lead'
    },
    {
      name: 'Sales Pipeline',
      slug: 'sales-pipeline',
      description: 'Visual tracking of leads from first contact to closed sale',
      benefit: 'Never lose track of potential revenue'
    },
    {
      name: 'Surveys & Feedback',
      slug: 'surveys-feedback',
      description: 'Automated surveys to gather feedback and improve customer satisfaction',
      benefit: 'Happy customers become loyal customers'
    },
    {
      name: 'Branded Mobile App',
      slug: 'branded-mobile-app',
      description: 'Custom mobile app for your business that customers can download',
      benefit: 'Stay top-of-mind on their home screen'
    }
  ];

  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white mr-4">
            <Users className="h-8 w-8" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-display" style={{ color: 'rgb(31, 10, 66)' }}>
            Customer Management
          </h1>
        </div>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Build stronger relationships with powerful tools to track, manage, and grow your customer base. 
          Turn one-time buyers into lifelong advocates for your business.
        </p>
      </div>

      {/* Key Benefits */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why Customer Management Matters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Heart className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Repeat Business</h3>
              <p className="text-gray-600 text-sm">It costs 5x more to acquire new customers than retain existing ones. Focus on lifetime value.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Heart className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Personal Touch</h3>
              <p className="text-gray-600 text-sm">Remember birthdays, preferences, and history. Make every customer feel special and valued.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Heart className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Referral Power</h3>
              <p className="text-gray-600 text-sm">Happy customers refer others. One great experience can lead to years of new business.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Customer Management Tools</h2>
        {features.map((feature) => (
          <Link
            key={feature.slug}
            to={`/features/customer-management/${feature.slug}`}
            className="group block"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-premium transition-all duration-300 hover:border-green-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    {feature.benefit}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200 ml-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Ready to Build Stronger Customer Relationships?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          See how our customer management tools can help you create loyal customers who 
          keep coming back and refer others to your business.
        </p>
        <button className="bg-white text-green-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-green-700 uppercase tracking-wide text-sm">
          See Customer Tools Demo
        </button>
      </div>
    </div>
  );
};

export default CustomerManagementOverview;
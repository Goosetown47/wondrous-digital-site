import React from 'react';
import { CheckCircle, ArrowRight, Smartphone, Bell, Star } from 'lucide-react';

const BrandedMobileApp = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Branded Mobile App
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Custom mobile app for your business that customers can download from app stores. 
          Stay top-of-mind on their home screen and provide convenient access to your services.
        </p>
      </div>

      {/* Why Mobile App Matters */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Your Business in Their Pocket</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Smartphone className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Always Visible</h3>
              <p className="text-gray-600 text-sm">Your logo on their home screen keeps your business top-of-mind every day</p>
            </div>
          </div>
          <div className="flex items-start">
            <Bell className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Direct Communication</h3>
              <p className="text-gray-600 text-sm">Send push notifications for promotions, reminders, and important updates</p>
            </div>
          </div>
          <div className="flex items-start">
            <Star className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Premium Experience</h3>
              <p className="text-gray-600 text-sm">Stand out from competitors with a professional mobile app experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Complete Mobile App Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Easy appointment booking and scheduling',
            'Service history and account management',
            'Push notifications for reminders and promotions',
            'In-app messaging and customer support',
            'Loyalty program and rewards tracking',
            'Photo galleries and service portfolios',
            'Customer reviews and testimonials',
            'Location finder with GPS directions',
            'Emergency contact and urgent service requests',
            'Payment processing and invoice viewing',
            'Referral program with sharing features',
            'News and updates from your business'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* App Screens */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Key App Screens</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Home Screen</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Quick booking button</li>
              <li>• Recent service history</li>
              <li>• Special offers</li>
              <li>• Emergency contact</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Booking Screen</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Service selection</li>
              <li>• Calendar availability</li>
              <li>• Instant confirmation</li>
              <li>• Special requests</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Account Screen</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Service history</li>
              <li>• Loyalty points</li>
              <li>• Payment methods</li>
              <li>• Preferences</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Smart Push Notifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Automated Notifications</h3>
            <ul className="space-y-2">
              {[
                'Appointment reminders 24 hours and 2 hours before',
                'Service completion confirmations and thank you messages',
                'Special promotions and seasonal offers',
                'Maintenance reminders based on service history',
                'Birthday and anniversary greetings with special offers'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Targeted Messaging</h3>
            <ul className="space-y-2">
              {[
                'Segment customers by service type and preferences',
                'Location-based notifications for nearby customers',
                'Behavior-triggered messages based on app usage',
                'Personalized offers based on purchase history',
                'Emergency alerts for urgent service availability'
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

      {/* App Store Presence */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Professional App Store Presence</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">App Store Optimization</h3>
            <p className="text-gray-600">Professional app store listings with optimized descriptions, keywords, and screenshots to help customers find and download your app.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand Consistency</h3>
            <p className="text-gray-600">Your app uses your logo, colors, and branding to create a cohesive experience across all customer touchpoints.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Regular Updates</h3>
            <p className="text-gray-600">We handle app store submissions, updates, and maintenance so your app stays current with the latest features and security standards.</p>
          </div>
        </div>
      </div>

      {/* Customer Benefits */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Customer Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-3">Convenience</h3>
            <p className="text-gray-600 text-sm">Book services, view history, and contact you with just a few taps</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-3">Exclusive Access</h3>
            <p className="text-gray-600 text-sm">App-only promotions and early access to new services</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-3">Loyalty Rewards</h3>
            <p className="text-gray-600 text-sm">Earn points and rewards for using the app and referring friends</p>
          </div>
        </div>
      </div>

      {/* Business Impact */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Mobile App Business Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
            <p className="text-gray-600 font-medium">More Repeat Bookings</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">60%</div>
            <p className="text-gray-600 font-medium">Higher Engagement</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
            <p className="text-gray-600 font-medium">Increase in Referrals</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">90%</div>
            <p className="text-gray-600 font-medium">Customer Retention</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Put Your Business in Every Customer's Pocket
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stand out from competitors with a professional mobile app that keeps customers 
          engaged and makes it easy for them to do business with you.
        </p>
        <button className="bg-white text-purple-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-purple-700 uppercase tracking-wide text-sm inline-flex items-center">
          Launch My Mobile App
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default BrandedMobileApp;
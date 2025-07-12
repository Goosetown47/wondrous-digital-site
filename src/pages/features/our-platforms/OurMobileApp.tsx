import React from 'react';
import { CheckCircle, ArrowRight, Smartphone, Bell, BarChart3 } from 'lucide-react';

const OurMobileApp = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Our Mobile App
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Manage your business on-the-go with our powerful mobile application. 
          Access your dashboard, respond to customers, and track performance from anywhere, anytime.
        </p>
      </div>

      {/* Why Mobile App Matters */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Your Business in Your Pocket</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Smartphone className="h-6 w-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Always Connected</h3>
              <p className="text-gray-600 text-sm">Manage your business from anywhere - at home, on-site, or traveling</p>
            </div>
          </div>
          <div className="flex items-start">
            <Bell className="h-6 w-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Notifications</h3>
              <p className="text-gray-600 text-sm">Get immediate alerts for new leads, appointments, and important updates</p>
            </div>
          </div>
          <div className="flex items-start">
            <BarChart3 className="h-6 w-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-Time Insights</h3>
              <p className="text-gray-600 text-sm">Check your business performance and metrics whenever you need them</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Complete Business Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Dashboard with key business metrics',
            'Lead and customer management',
            'Appointment scheduling and calendar',
            'Real-time notifications and alerts',
            'Customer communication tools',
            'Performance analytics and reports',
            'Task and project management',
            'Team collaboration features',
            'Invoice and payment tracking',
            'Review and reputation monitoring',
            'Marketing campaign management',
            'Offline access to critical data'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key App Screens */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Key App Screens</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Dashboard</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Today's appointments</li>
              <li>• New leads and messages</li>
              <li>• Revenue and performance</li>
              <li>• Quick action buttons</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Customer Management</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Customer profiles and history</li>
              <li>• Communication timeline</li>
              <li>• Notes and preferences</li>
              <li>• Quick contact options</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• New lead alerts</li>
              <li>• Appointment reminders</li>
              <li>• Review notifications</li>
              <li>• System updates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile-Specific Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Mobile-Optimized Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Touch-Optimized Interface</h3>
            <ul className="space-y-2">
              {[
                'Large, easy-to-tap buttons and controls',
                'Swipe gestures for quick navigation',
                'Voice input for notes and messages',
                'Camera integration for photos and documents',
                'GPS integration for location services'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Notifications</h3>
            <ul className="space-y-2">
              {[
                'Customizable notification preferences',
                'Priority alerts for urgent matters',
                'Quiet hours and do-not-disturb settings',
                'Location-based notifications',
                'Smart bundling of similar alerts'
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

      {/* Offline Capabilities */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Offline Access</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Without Internet</h3>
            <p className="text-gray-600">Critical business data is cached locally so you can access customer information, schedules, and notes even without an internet connection.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Available Offline</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Customer contact information</li>
                <li>• Today's appointment schedule</li>
                <li>• Recent customer notes and history</li>
                <li>• Frequently used forms and checklists</li>
                <li>• Basic performance metrics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sync When Connected</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic data synchronization</li>
                <li>• Conflict resolution for changes</li>
                <li>• Background updates when possible</li>
                <li>• Priority sync for critical data</li>
                <li>• Status indicators for sync progress</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Team Collaboration */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Team Collaboration Features</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-User Support</h3>
            <p className="text-gray-600">Give your team members access to the app with role-based permissions and real-time collaboration.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Team Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Individual user accounts and profiles</li>
                <li>• Role-based access controls</li>
                <li>• Shared calendars and schedules</li>
                <li>• Team messaging and communication</li>
                <li>• Task assignment and tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Real-Time Updates</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Live synchronization across devices</li>
                <li>• Instant notifications for team updates</li>
                <li>• Shared notes and customer information</li>
                <li>• Collaborative project management</li>
                <li>• Activity feeds and status updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Privacy */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Security & Privacy</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise-Grade Security</h3>
            <p className="text-gray-600">Your business data is protected with the same security standards used by Fortune 500 companies.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-3">Data Encryption</h3>
              <p className="text-gray-600 text-sm">All data encrypted in transit and at rest with industry-standard protocols</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-3">Secure Authentication</h3>
              <p className="text-gray-600 text-sm">Biometric login, two-factor authentication, and secure session management</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-3">Privacy Controls</h3>
              <p className="text-gray-600 text-sm">Granular privacy settings and compliance with data protection regulations</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Store & Updates */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">App Store & Updates</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Available on All Platforms</h3>
            <p className="text-gray-600">Download from the App Store (iOS) or Google Play Store (Android) with regular updates and new features.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">App Store Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Professional app store listings</li>
                <li>• High-quality screenshots and descriptions</li>
                <li>• Regular app store optimization</li>
                <li>• Customer reviews and ratings</li>
                <li>• Easy installation and setup</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Continuous Improvement</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Monthly feature updates</li>
                <li>• Bug fixes and performance improvements</li>
                <li>• New integrations and capabilities</li>
                <li>• User feedback implementation</li>
                <li>• Platform compatibility updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Mobile App Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">50%</div>
            <p className="text-gray-600 font-medium">Faster Response Time</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">75%</div>
            <p className="text-gray-600 font-medium">More Productive</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">90%</div>
            <p className="text-gray-600 font-medium">Better Customer Service</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
            <p className="text-gray-600 font-medium">Business Access</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Take Your Business Mobile
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Never miss an opportunity again. Get our mobile app and manage your business 
          from anywhere with real-time access to everything you need.
        </p>
        <button className="bg-white text-indigo-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-indigo-700 uppercase tracking-wide text-sm inline-flex items-center">
          Download Our Mobile App
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default OurMobileApp;
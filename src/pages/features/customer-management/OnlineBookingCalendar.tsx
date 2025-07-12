import React from 'react';
import { CheckCircle, ArrowRight, Calendar, Clock, Smartphone } from 'lucide-react';

const OnlineBookingCalendar = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Online Booking Calendar
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Let customers book appointments 24/7 with automatic confirmations and reminders. 
          Fill your calendar while you sleep and reduce no-shows by 50%.
        </p>
      </div>

      {/* Why Online Booking Matters */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Book Appointments 24/7</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Always Available</h3>
              <p className="text-gray-600 text-sm">Customers can book at 2 AM or during busy periods when you can't answer calls</p>
            </div>
          </div>
          <div className="flex items-start">
            <Smartphone className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Customer Convenience</h3>
              <p className="text-gray-600 text-sm">67% of customers prefer to book online rather than call during business hours</p>
            </div>
          </div>
          <div className="flex items-start">
            <Calendar className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Fewer No-Shows</h3>
              <p className="text-gray-600 text-sm">Automatic reminders reduce no-shows by 50% compared to manual scheduling</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Comprehensive Booking System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Real-time availability with instant confirmation',
            'Multiple service types with different durations',
            'Staff scheduling for multi-person businesses',
            'Buffer time between appointments',
            'Custom intake forms for service requirements',
            'Payment collection at time of booking',
            'Automatic confirmation emails and texts',
            'Reminder sequences to prevent no-shows',
            'Easy rescheduling and cancellation options',
            'Waitlist management for popular time slots',
            'Recurring appointment scheduling',
            'Group booking for multiple participants'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Flow */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Simple 4-Step Booking Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Choose Service</h3>
            <p className="text-gray-600 text-sm">Customer selects the service they need from your offerings</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Pick Date & Time</h3>
            <p className="text-gray-600 text-sm">See only available slots based on your real calendar</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Enter Details</h3>
            <p className="text-gray-600 text-sm">Provide contact info and specific requirements</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Confirmation</h3>
            <p className="text-gray-600 text-sm">Immediate booking confirmation via email and text</p>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Smart Scheduling Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Intelligent Availability</h3>
            <ul className="space-y-2">
              {[
                'Sync with your personal calendar (Google, Outlook)',
                'Block out personal time and vacations',
                'Set different hours for different services',
                'Travel time between appointments',
                'Lunch breaks and prep time built in'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Experience</h3>
            <ul className="space-y-2">
              {[
                'Mobile-optimized booking widget',
                'Embedded directly in your website',
                'Custom branding and colors',
                'Multiple language support',
                'Accessibility features for all users'
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

      {/* Reminder System */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Automated Reminder System</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Channel Reminders</h3>
            <p className="text-gray-600">Send reminders via email, text, or phone calls based on customer preference.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">24 Hours Before</h4>
              <p className="text-sm text-gray-600">Initial reminder with appointment details and preparation instructions</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">2 Hours Before</h4>
              <p className="text-sm text-gray-600">Final reminder with location info and your contact number</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">After Appointment</h4>
              <p className="text-sm text-gray-600">Thank you message and follow-up care instructions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Benefits */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Business Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">50%</div>
            <p className="text-gray-600 font-medium">Fewer No-Shows</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">30%</div>
            <p className="text-gray-600 font-medium">More Bookings</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-gray-600 font-medium">Booking Availability</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">15hrs</div>
            <p className="text-gray-600 font-medium">Admin Time Saved/Week</p>
          </div>
        </div>
      </div>

      {/* Integration */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Seamless Integration</h2>
        <div className="space-y-4">
          <p className="text-gray-700">Your booking calendar works with everything you already use:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Calendar Apps</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Google Calendar</li>
                <li>• Outlook Calendar</li>
                <li>• Apple Calendar</li>
                <li>• Any CalDAV calendar</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Business Tools</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Customer CRM</li>
                <li>• Payment processing</li>
                <li>• Email marketing</li>
                <li>• Team communications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Fill Your Calendar Automatically
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop playing phone tag to schedule appointments. Let customers book online 
          24/7 while you focus on providing great service.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-blue-700 uppercase tracking-wide text-sm inline-flex items-center">
          Set Up Online Booking
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default OnlineBookingCalendar;
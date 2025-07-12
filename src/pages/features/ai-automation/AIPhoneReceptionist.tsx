import React from 'react';
import { CheckCircle, ArrowRight, Phone, Clock, Bot } from 'lucide-react';

const AIPhoneReceptionist = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          AI Phone Receptionist
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          A friendly AI voice that answers your phone 24/7, books appointments, answers common questions, 
          and ensures you never miss a potential customer again.
        </p>
      </div>

      {/* Why AI Receptionist Matters */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Never Miss Another Customer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Availability</h3>
              <p className="text-gray-600 text-sm">Your business never sleeps. Answer calls at 2 AM or during busy hours</p>
            </div>
          </div>
          <div className="flex items-start">
            <Phone className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Image</h3>
              <p className="text-gray-600 text-sm">Always-friendly, always-available service makes your business look established</p>
            </div>
          </div>
          <div className="flex items-start">
            <Bot className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Response</h3>
              <p className="text-gray-600 text-sm">No more voicemail tag. Callers get immediate answers and assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">What Your AI Receptionist Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Answer calls with your custom greeting',
            'Book appointments directly in your calendar',
            'Answer frequently asked questions',
            'Take detailed messages and contact information',
            'Transfer calls to you when needed',
            'Provide business hours and location info',
            'Handle multiple calls simultaneously',
            'Send confirmation texts for appointments',
            'Collect customer information for follow-up',
            'Provide pricing and service details',
            'Schedule callbacks at convenient times',
            'Handle emergency or urgent call routing'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Call Comes In</h3>
            <p className="text-gray-600 text-sm">Customer calls your business number</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Answers</h3>
            <p className="text-gray-600 text-sm">Friendly AI greets caller professionally</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Handles Request</h3>
            <p className="text-gray-600 text-sm">Books appointment or answers questions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Updates You</h3>
            <p className="text-gray-600 text-sm">Sends summary and any required actions</p>
          </div>
        </div>
      </div>

      {/* Customization */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Fully Customized for Your Business</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Voice & Brand</h3>
            <ul className="space-y-2">
              {[
                'Custom greeting with your business name',
                'Tone and personality matching your brand',
                'Industry-specific knowledge and terminology',
                'Your service offerings and pricing',
                'Your business hours and policies'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Integration</h3>
            <ul className="space-y-2">
              {[
                'Connects to your booking calendar',
                'Accesses your customer database',
                'Updates your CRM automatically',
                'Sends notifications to your team',
                'Integrates with your existing phone system'
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

      {/* Cost Savings */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">The Economics Make Sense</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traditional Receptionist</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• $30,000-50,000/year salary</li>
              <li>• Benefits and taxes</li>
              <li>• Only works 40 hours/week</li>
              <li>• Sick days and vacation time</li>
              <li>• Limited to one call at a time</li>
              <li>• Training and management required</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Receptionist</h3>
            <ul className="space-y-2 text-green-700">
              <li>• Fraction of the cost</li>
              <li>• No benefits or overhead</li>
              <li>• Works 24/7/365</li>
              <li>• Never calls in sick</li>
              <li>• Handles unlimited simultaneous calls</li>
              <li>• Constantly learning and improving</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Ready for Your AI Receptionist?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop missing calls and start capturing every opportunity. Get an AI receptionist 
          that works around the clock to grow your business.
        </p>
        <button className="bg-white text-purple-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-purple-700 uppercase tracking-wide text-sm inline-flex items-center">
          Get My AI Receptionist
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AIPhoneReceptionist;
import React from 'react';
import { CheckCircle, ArrowRight, PhoneCall, MessageSquare, Clock } from 'lucide-react';

const MissedCallTextBacks = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Missed Call Text Backs
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          When someone calls and you can't answer, they instantly get a text saying you'll call them back soon. 
          Turn 70% of missed calls into booked appointments automatically.
        </p>
      </div>

      {/* Why Missed Call Texts Matter */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Stop Losing Customers to Missed Calls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <PhoneCall className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">The Problem</h3>
              <p className="text-gray-600 text-sm">90% of customers won't leave a voicemail and 80% won't call back</p>
            </div>
          </div>
          <div className="flex items-start">
            <MessageSquare className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">The Solution</h3>
              <p className="text-gray-600 text-sm">Instant text messages keep leads warm and engaged</p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">The Result</h3>
              <p className="text-gray-600 text-sm">70% of missed calls convert to appointments with instant text follow-up</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-8">How Missed Call Text Backs Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <PhoneCall className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Call Comes In</h3>
            <p className="text-gray-600 text-sm">Customer calls your business number</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Call Goes Unanswered</h3>
            <p className="text-gray-600 text-sm">You're busy with another customer or after hours</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Text Sent</h3>
            <p className="text-gray-600 text-sm">System immediately sends personalized text message</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Customer Responds</h3>
            <p className="text-gray-600 text-sm">Lead stays warm and often books immediately</p>
          </div>
        </div>
      </div>

      {/* Message Examples */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Sample Text Messages</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">General Business</h3>
            <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700">"Hi! I see you just called. I'm with another customer right now but I'll call you back within 15 minutes. If it's urgent, text me back and I'll prioritize your call. Thanks! - [Your Name]"</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Business (Emergency)</h3>
            <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-700">"Got your call! If this is an emergency, text URGENT and I'll call you back immediately. Otherwise, I'll call you back within the hour. - [Business Name] Emergency Services"</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Services</h3>
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-700">"Thank you for calling [Business Name]! I'm currently in a consultation but I'll return your call by [time]. You can also text me your question or schedule online at [link]. Looking forward to helping you!"</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">After Hours</h3>
            <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
              <p className="text-gray-700">"Hi! You called [Business Name] after business hours. I'll call you back first thing tomorrow morning. For urgent matters, text me back. Thanks for your call!"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Options */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Fully Customizable Messages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Personalized with your name and business',
            'Different messages for business hours vs after hours',
            'Emergency vs non-emergency response options',
            'Include links to online booking or website',
            'Add your callback time commitments',
            'Customize tone to match your brand voice',
            'Multiple message variations to prevent spam detection',
            'Include special offers or promotions',
            'Location-specific information for multiple offices',
            'Service-specific messages based on caller ID',
            'Integration with your calendar for accurate callback times',
            'Automatic follow-up if no response received'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Missed Call Text Back Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">70%</div>
            <p className="text-gray-600 font-medium">Missed Calls Convert</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
            <p className="text-gray-600 font-medium">Text Open Rate</p>
          </div>
          <div className="flex-[1.2]">
            <div className="text-3xl font-bold text-blue-600 mb-2">5 min</div>
            <p className="text-gray-600 font-medium">Average Response Time</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">300%</div>
            <p className="text-gray-600 font-medium">ROI Increase</p>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Smart Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Intelligent Detection</h3>
            <ul className="space-y-2">
              {[
                'Distinguishes between missed calls and hangups',
                'Filters out spam and robocalls',
                'Recognizes repeat callers',
                'Detects emergency keywords in voicemails',
                'Identifies existing customers vs new leads'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Follow-up Automation</h3>
            <ul className="space-y-2">
              {[
                'Automatic follow-up if no response in 24 hours',
                'Integration with your CRM and calendar',
                'Lead scoring based on response behavior',
                'Escalation to team members if needed',
                'Analytics on text response rates'
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

      {/* CTA */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Stop Losing Customers to Missed Calls
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Turn every missed call into a potential appointment. Set up instant text responses 
          that keep leads warm and convert at 70% rates.
        </p>
        <button className="bg-white text-red-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-red-700 uppercase tracking-wide text-sm inline-flex items-center">
          Set Up Missed Call Texts
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MissedCallTextBacks;
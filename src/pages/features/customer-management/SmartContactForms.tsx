import React from 'react';
import { CheckCircle, ArrowRight, FormInput, Zap, Target } from 'lucide-react';

const SmartContactForms = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Smart Contact Forms
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Intelligent forms that capture leads and automatically add them to your CRM. 
          Turn every website visitor into a trackable lead with smart questions and instant follow-up.
        </p>
      </div>

      {/* Why Smart Forms Matter */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Turn Visitors Into Trackable Leads</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <FormInput className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Capture Everything</h3>
              <p className="text-gray-600 text-sm">Every form submission becomes a complete customer profile in your CRM</p>
            </div>
          </div>
          <div className="flex items-start">
            <Zap className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Response</h3>
              <p className="text-gray-600 text-sm">Automatic confirmation and follow-up within seconds of submission</p>
            </div>
          </div>
          <div className="flex items-start">
            <Target className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Qualification</h3>
              <p className="text-gray-600 text-sm">Forms adapt based on answers to qualify leads automatically</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Types */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Smart Form Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Contact forms with instant confirmation',
            'Service request forms with project details',
            'Quote request forms with automatic pricing',
            'Consultation booking with calendar integration',
            'Newsletter signup with segmentation',
            'Event registration with payment processing',
            'Survey forms with conditional logic',
            'Support ticket forms with priority routing',
            'Lead magnets with content delivery',
            'Feedback forms with sentiment analysis',
            'Referral forms with reward tracking',
            'Emergency service forms with urgent alerts'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Features */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Intelligent Form Features</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conditional Logic</h3>
            <p className="text-gray-600">Forms adapt based on previous answers. If someone selects "Emergency Repair," they see urgent contact options. If they select "Routine Maintenance," they see scheduling options.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Progressive Profiling</h3>
            <p className="text-gray-600">Ask different questions to returning visitors. First-time visitors get basic contact info, returning visitors get deeper qualification questions.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Validation</h3>
            <p className="text-gray-600">Real-time validation ensures clean data entry. Phone numbers are formatted correctly, emails are verified, and addresses are validated.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead Scoring</h3>
            <p className="text-gray-600">Automatically score leads based on their answers. High-value prospects get immediate attention, while others enter nurture sequences.</p>
          </div>
        </div>
      </div>

      {/* Form Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Form Examples by Industry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Business Form</h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong>What service do you need?</strong>
                <p className="text-gray-600">• Plumbing • Electrical • HVAC • Emergency</p>
              </div>
              <div>
                <strong>When do you need this done?</strong>
                <p className="text-gray-600">• Today (Emergency) • This week • Next week • I'm flexible</p>
              </div>
              <div>
                <strong>Describe the issue:</strong>
                <p className="text-gray-600">[Text area for details]</p>
              </div>
              <div>
                <strong>Best way to contact you?</strong>
                <p className="text-gray-600">• Call • Text • Email</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Services Form</h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong>What type of project?</strong>
                <p className="text-gray-600">• Website Design • Marketing • Consulting • Other</p>
              </div>
              <div>
                <strong>What's your budget range?</strong>
                <p className="text-gray-600">• Under $5K • $5K-$15K • $15K-$50K • $50K+</p>
              </div>
              <div>
                <strong>Timeline for completion?</strong>
                <p className="text-gray-600">• ASAP • 1-3 months • 3-6 months • 6+ months</p>
              </div>
              <div>
                <strong>How did you hear about us?</strong>
                <p className="text-gray-600">• Google • Referral • Social Media • Other</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Automatic Actions After Submission</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Immediate Actions</h3>
            <ul className="space-y-2">
              {[
                'Send confirmation email to customer',
                'Add contact to CRM with all details',
                'Send instant SMS confirmation',
                'Notify your team via email/text',
                'Create task in your project management system'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Follow-up Sequences</h3>
            <ul className="space-y-2">
              {[
                'Schedule follow-up call within 1 hour',
                'Add to appropriate email nurture sequence',
                'Set reminders for team follow-up',
                'Trigger specific workflows based on form answers',
                'Update lead score and priority level'
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

      {/* Performance Metrics */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Form Performance Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
            <p className="text-gray-600 font-medium">Higher Completion Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">60%</div>
            <p className="text-gray-600 font-medium">More Qualified Leads</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">5 sec</div>
            <p className="text-gray-600 font-medium">Response Time</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">40%</div>
            <p className="text-gray-600 font-medium">Better Lead Quality</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Capture Every Lead Automatically
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop losing potential customers to basic contact forms. Get smart forms 
          that qualify leads, trigger follow-ups, and feed your CRM automatically.
        </p>
        <button className="bg-white text-purple-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-purple-700 uppercase tracking-wide text-sm inline-flex items-center">
          Upgrade My Forms
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SmartContactForms;
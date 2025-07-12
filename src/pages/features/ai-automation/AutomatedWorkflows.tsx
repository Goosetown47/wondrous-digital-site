import React from 'react';
import { CheckCircle, ArrowRight, Workflow, Clock, Zap } from 'lucide-react';

const AutomatedWorkflows = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Automated Workflows
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Custom automation sequences triggered by customer actions and behaviors. 
          Streamline your business processes and save 15+ hours per week on repetitive tasks.
        </p>
      </div>

      {/* Why Workflows Matter */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Automate Everything That Doesn't Need You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Time Savings</h3>
              <p className="text-gray-600 text-sm">Businesses save 15-20 hours per week with automated workflows</p>
            </div>
          </div>
          <div className="flex items-start">
            <Zap className="h-6 w-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consistency</h3>
              <p className="text-gray-600 text-sm">Never forget a follow-up or miss a step in your process again</p>
            </div>
          </div>
          <div className="flex items-start">
            <Workflow className="h-6 w-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Scale Without Stress</h3>
              <p className="text-gray-600 text-sm">Handle more customers without hiring more staff</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Powerful Workflow Automations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'New customer onboarding sequences',
            'Appointment booking and confirmation flows',
            'Lead qualification and scoring processes',
            'Invoice generation and payment reminders',
            'Review request and reputation management',
            'Customer win-back campaigns',
            'Birthday and anniversary communications',
            'Inventory alerts and reorder processes',
            'Staff task assignment and tracking',
            'Social media posting schedules',
            'Email list segmentation and tagging',
            'Customer satisfaction surveys'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Examples Detail */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Sample Workflows in Action</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">New Lead Workflow</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-indigo-600">1</span>
                </div>
                <p className="text-sm"><strong>Trigger:</strong> Contact form submitted</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-indigo-600">2</span>
                </div>
                <p className="text-sm"><strong>Action:</strong> Send instant SMS confirmation</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-indigo-600">3</span>
                </div>
                <p className="text-sm"><strong>Action:</strong> Add to CRM with tags</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-indigo-600">4</span>
                </div>
                <p className="text-sm"><strong>Action:</strong> Notify team member</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Service Workflow</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-indigo-600">1</span>
                </div>
                <p className="text-sm"><strong>Trigger:</strong> Service completed</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-indigo-600">2</span>
                </div>
                <p className="text-sm"><strong>Action:</strong> Send thank you message</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-indigo-600">3</span>
                </div>
                <p className="text-sm"><strong>Wait:</strong> 3 days</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-indigo-600">4</span>
                </div>
                <p className="text-sm"><strong>Action:</strong> Request review</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Types */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Workflow Triggers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Actions</h3>
            <ul className="space-y-2">
              {[
                'Website form submissions',
                'Email opens and clicks',
                'Appointment bookings or cancellations',
                'Purchase completions',
                'Phone calls and voicemails',
                'Social media interactions'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Time-Based Triggers</h3>
            <ul className="space-y-2">
              {[
                'Specific dates and times',
                'Days after customer action',
                'Recurring schedules (daily, weekly, monthly)',
                'Customer birthdays and anniversaries',
                'Service reminder dates',
                'Payment due dates'
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

      {/* Workflow Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Automated Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Communication</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Send SMS or email</li>
              <li>• Make phone calls</li>
              <li>• Post to social media</li>
              <li>• Send direct mail</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Management</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Update CRM records</li>
              <li>• Add tags and notes</li>
              <li>• Create tasks</li>
              <li>• Generate reports</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Process</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Create invoices</li>
              <li>• Schedule appointments</li>
              <li>• Assign team tasks</li>
              <li>• Update inventory</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Time Savings */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Time & Money Saved</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">15+</div>
            <p className="text-gray-600 font-medium">Hours Saved Per Week</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">90%</div>
            <p className="text-gray-600 font-medium">Fewer Manual Tasks</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
            <p className="text-gray-600 font-medium">Consistency Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">$1000s</div>
            <p className="text-gray-600 font-medium">Monthly Labor Savings</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Automate Your Way to More Free Time
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop doing the same tasks over and over. Set up automated workflows 
          that handle routine business processes so you can focus on growth.
        </p>
        <button className="bg-white text-indigo-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-indigo-700 uppercase tracking-wide text-sm inline-flex items-center">
          Build My Workflows
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AutomatedWorkflows;
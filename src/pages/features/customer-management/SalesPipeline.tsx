import React from 'react';
import { CheckCircle, ArrowRight, TrendingUp, Target, BarChart3 } from 'lucide-react';

const SalesPipeline = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Sales Pipeline
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Visual tracking of leads from first contact to closed sale. 
          Never lose track of potential revenue and know exactly where every prospect stands in your sales process.
        </p>
      </div>

      {/* Why Pipeline Matters */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">See Your Revenue in Motion</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <TrendingUp className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Every Dollar</h3>
              <p className="text-gray-600 text-sm">See exactly how much potential revenue is in each stage of your sales process</p>
            </div>
          </div>
          <div className="flex items-start">
            <Target className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Focus Your Efforts</h3>
              <p className="text-gray-600 text-sm">Identify which leads need attention and which are ready to close</p>
            </div>
          </div>
          <div className="flex items-start">
            <BarChart3 className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Predict Growth</h3>
              <p className="text-gray-600 text-sm">Forecast future revenue based on your current pipeline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-8">Visual Sales Pipeline Stages</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-gray-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">New Lead</h3>
            <p className="text-gray-600 text-sm">Initial contact made</p>
          </div>
          <div className="bg-blue-100 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-blue-300 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Qualified</h3>
            <p className="text-gray-600 text-sm">Needs confirmed</p>
          </div>
          <div className="bg-yellow-100 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-yellow-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Proposal</h3>
            <p className="text-gray-600 text-sm">Quote provided</p>
          </div>
          <div className="bg-orange-100 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-orange-600">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Negotiation</h3>
            <p className="text-gray-600 text-sm">Terms discussed</p>
          </div>
          <div className="bg-green-100 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-green-300 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-green-600">5</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Closed Won</h3>
            <p className="text-gray-600 text-sm">Deal completed</p>
          </div>
        </div>
      </div>

      {/* Pipeline Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Complete Pipeline Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Drag-and-drop interface to move deals between stages',
            'Automatic deal value calculations and forecasting',
            'Activity tracking for every customer interaction',
            'Customizable stages that match your sales process',
            'Deal probability scoring based on stage and activity',
            'Automated follow-up reminders for stalled deals',
            'Team collaboration with notes and task assignments',
            'Revenue reporting and conversion rate analysis',
            'Lost deal tracking with reason codes',
            'Integration with calendar for scheduled follow-ups',
            'Email and SMS communication directly from pipeline',
            'Mobile access to manage deals on the go'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Management */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Smart Deal Management</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deal Cards Show Everything</h3>
            <p className="text-gray-600">Each deal card displays contact info, deal value, last activity, next action, and days in current stage. Get the full picture at a glance.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatic Activity Logging</h3>
            <p className="text-gray-600">Every call, email, text, and meeting is automatically logged to the deal. See the complete interaction history without manual data entry.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Reminders</h3>
            <p className="text-gray-600">Get notified when deals have been in a stage too long, when follow-ups are due, or when high-value prospects need attention.</p>
          </div>
        </div>
      </div>

      {/* Analytics & Reporting */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Pipeline Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Revenue Forecasting</h3>
            <ul className="space-y-2">
              {[
                'Total pipeline value by stage',
                'Weighted forecast based on deal probability',
                'Monthly and quarterly revenue projections',
                'Conversion rates between stages',
                'Average deal size and sales cycle length'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Insights</h3>
            <ul className="space-y-2">
              {[
                'Win/loss ratios by lead source',
                'Time spent in each pipeline stage',
                'Most effective sales activities',
                'Seasonal trends and patterns',
                'Team member performance comparisons'
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

      {/* Business Impact */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Pipeline Management Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">27%</div>
            <p className="text-gray-600 font-medium">Higher Close Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">18%</div>
            <p className="text-gray-600 font-medium">Shorter Sales Cycle</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
            <p className="text-gray-600 font-medium">Forecast Accuracy</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <p className="text-gray-600 font-medium">Lost Opportunities</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Take Control of Your Sales Process
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop losing track of potential revenue. Get a visual sales pipeline 
          that shows you exactly where every deal stands and what to do next.
        </p>
        <button className="bg-white text-green-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-green-700 uppercase tracking-wide text-sm inline-flex items-center">
          Build My Pipeline
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SalesPipeline;
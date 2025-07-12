import React from 'react';
import { CheckCircle, ArrowRight, BarChart3, Users, TrendingUp } from 'lucide-react';

const MarketingDashboard = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Marketing Dashboard
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Unified view of all your marketing efforts and customer interactions. 
          See the complete picture of your business growth with real-time analytics and actionable insights.
        </p>
      </div>

      {/* Why Marketing Dashboard Matters */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">See Your Entire Marketing Picture</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <BarChart3 className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Unified View</h3>
              <p className="text-gray-600 text-sm">All your marketing channels and customer data in one central dashboard</p>
            </div>
          </div>
          <div className="flex items-start">
            <Users className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Customer Journey</h3>
              <p className="text-gray-600 text-sm">Track customers from first contact to loyal advocate across all touchpoints</p>
            </div>
          </div>
          <div className="flex items-start">
            <TrendingUp className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Data-Driven Decisions</h3>
              <p className="text-gray-600 text-sm">Make informed marketing decisions based on real performance data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Comprehensive Marketing Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Real-time lead tracking and attribution',
            'Customer acquisition cost analysis',
            'Lifetime value calculations and trends',
            'Marketing channel performance comparison',
            'Conversion funnel analysis and optimization',
            'Campaign ROI tracking and reporting',
            'Customer behavior and engagement metrics',
            'Revenue attribution by marketing source',
            'Social media performance analytics',
            'Email marketing campaign results',
            'Website traffic and conversion analysis',
            'Review and reputation monitoring'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Dashboard Overview Sections</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Performance Overview</h3>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 mb-3">Key metrics that matter most to your business growth:</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">127</div>
                  <p className="text-sm text-gray-600">New Leads This Month</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$15,420</div>
                  <p className="text-sm text-gray-600">Revenue Generated</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">23%</div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$121</div>
                  <p className="text-sm text-gray-600">Cost Per Lead</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Lead Sources & Attribution</h3>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 mb-3">See exactly where your best customers come from:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Google Search: 45% of leads, $8,500 revenue</li>
                <li>• Referrals: 25% of leads, $4,200 revenue</li>
                <li>• Social Media: 15% of leads, $1,800 revenue</li>
                <li>• Direct Traffic: 15% of leads, $920 revenue</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Journey Analytics</h3>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 mb-3">Track the complete customer experience:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Average time from lead to customer: 7 days</li>
                <li>• Most effective touchpoints before conversion</li>
                <li>• Drop-off points in your sales funnel</li>
                <li>• Customer lifetime value by acquisition source</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Channels */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Multi-Channel Marketing Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Digital Marketing</h3>
            <ul className="space-y-2">
              {[
                'Website traffic and conversion tracking',
                'SEO performance and keyword rankings',
                'Social media engagement and reach',
                'Email marketing open and click rates',
                'Online advertising performance and ROI'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Traditional Marketing</h3>
            <ul className="space-y-2">
              {[
                'Phone call tracking and attribution',
                'Referral program performance',
                'Direct mail campaign results',
                'Local advertising effectiveness',
                'Word-of-mouth and review impact'
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

      {/* Customer Analytics */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Customer Intelligence</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Segmentation</h3>
            <p className="text-gray-600">Understand different customer groups and their behaviors to tailor your marketing approach.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Demographics</h3>
              <p className="text-gray-600 text-sm">Age, location, income, and other demographic insights</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Behavior</h3>
              <p className="text-gray-600 text-sm">Purchase patterns, engagement levels, and preferences</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Value</h3>
              <p className="text-gray-600 text-sm">Lifetime value, purchase frequency, and profitability</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Tracking */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Marketing ROI & Attribution</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Revenue Attribution</h3>
            <p className="text-gray-600">Track every dollar back to its marketing source to understand what's really driving growth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Investment Tracking</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Marketing spend by channel and campaign</li>
                <li>• Time and resource allocation</li>
                <li>• Tool and platform costs</li>
                <li>• Staff time and overhead</li>
                <li>• Total cost of customer acquisition</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Return Measurement</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Revenue generated by source</li>
                <li>• Customer lifetime value</li>
                <li>• Profit margins by customer type</li>
                <li>• Long-term value projections</li>
                <li>• ROI calculations and trends</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Integration */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Marketing Automation Integration</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connected Systems</h3>
            <p className="text-gray-600">Your dashboard integrates with all your marketing tools to provide a complete picture of performance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• CRM and customer database</li>
                <li>• Email marketing platforms</li>
                <li>• Social media accounts</li>
                <li>• Website analytics</li>
                <li>• Call tracking systems</li>
                <li>• Review and reputation platforms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Automated Insights</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Performance alerts and notifications</li>
                <li>• Trend identification and reporting</li>
                <li>• Anomaly detection and warnings</li>
                <li>• Optimization recommendations</li>
                <li>• Predictive analytics and forecasting</li>
                <li>• Automated report generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Access */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Mobile Marketing Dashboard</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Intelligence On-the-Go</h3>
            <p className="text-gray-600">Access your marketing performance data anywhere with our mobile-optimized dashboard.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Mobile Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Touch-optimized interface</li>
                <li>• Quick metric overview cards</li>
                <li>• Push notifications for important alerts</li>
                <li>• Offline data access</li>
                <li>• Voice search for metrics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Instant lead notifications</li>
                <li>• One-tap report sharing</li>
                <li>• Quick campaign adjustments</li>
                <li>• Emergency response tools</li>
                <li>• Team collaboration features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Marketing Dashboard Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">40%</div>
            <p className="text-gray-600 font-medium">Better Marketing ROI</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">60%</div>
            <p className="text-gray-600 font-medium">Faster Decision Making</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">25%</div>
            <p className="text-gray-600 font-medium">Reduced Marketing Waste</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">90%</div>
            <p className="text-gray-600 font-medium">Better Data Visibility</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Get Complete Marketing Visibility
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop guessing which marketing efforts are working. Get a unified dashboard 
          that shows exactly what's driving growth and where to invest your time and money.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-blue-700 uppercase tracking-wide text-sm inline-flex items-center">
          Access My Marketing Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MarketingDashboard;
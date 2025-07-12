import React from 'react';
import { CheckCircle, ArrowRight, BarChart3, FileText, TrendingUp } from 'lucide-react';

const SEOReporting = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          SEO Reporting
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Monthly reports showing your search visibility progress. 
          Clear, actionable insights that demonstrate ROI and guide your SEO strategy forward.
        </p>
      </div>

      {/* Why SEO Reporting Matters */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why SEO Reporting Is Essential</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <BarChart3 className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">SEO takes time - reports show you're moving in the right direction</p>
            </div>
          </div>
          <div className="flex items-start">
            <FileText className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Prove ROI</h3>
              <p className="text-gray-600 text-sm">Demonstrate the business value of your SEO investment with clear metrics</p>
            </div>
          </div>
          <div className="flex items-start">
            <TrendingUp className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Guide Strategy</h3>
              <p className="text-gray-600 text-sm">Data-driven insights help prioritize efforts and optimize results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Components */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Comprehensive SEO Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Executive summary with key wins and insights',
            'Organic traffic growth and trend analysis',
            'Keyword ranking improvements and opportunities',
            'Competitor performance comparison',
            'Technical SEO health and issue resolution',
            'Content performance and optimization recommendations',
            'Local search visibility and Google My Business metrics',
            'Backlink profile growth and quality assessment',
            'Conversion tracking and goal completion rates',
            'Page speed and Core Web Vitals performance',
            'Mobile usability and responsive design metrics',
            'Search console data and error monitoring'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report Structure */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Monthly Report Structure</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Executive Summary</h3>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 mb-3">High-level overview perfect for business owners and stakeholders:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Key performance indicators and month-over-month changes</li>
                <li>• Major wins and achievements</li>
                <li>• Priority recommendations for next month</li>
                <li>• Business impact summary (leads, calls, revenue)</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Traffic & Visibility Analysis</h3>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 mb-3">Detailed breakdown of your search performance:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Organic traffic trends with year-over-year comparisons</li>
                <li>• Top performing pages and content</li>
                <li>• Search query analysis and user intent insights</li>
                <li>• Geographic performance by location</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Keyword Performance</h3>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 mb-3">Comprehensive ranking analysis:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ranking improvements and declines with explanations</li>
                <li>• New keywords entering top 10 and top 3 positions</li>
                <li>• Competitor ranking comparison</li>
                <li>• Keyword opportunity identification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Reports */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Visual Data Presentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Charts & Graphs</h3>
            <ul className="space-y-2">
              {[
                'Traffic trend lines showing growth over time',
                'Ranking position charts for key keywords',
                'Competitor comparison bar charts',
                'Conversion funnel visualization',
                'Geographic performance heat maps'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy-to-Read Format</h3>
            <ul className="space-y-2">
              {[
                'Color-coded performance indicators',
                'Executive summary for quick scanning',
                'Detailed appendix for technical teams',
                'Action item prioritization',
                'Progress photos and before/after comparisons'
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

      {/* Business Impact Metrics */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Business Impact Tracking</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Attribution</h3>
            <p className="text-gray-600">Connect SEO efforts directly to business results. Track leads, phone calls, and revenue generated from organic search traffic.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Lead Generation</h3>
              <p className="text-gray-600 text-sm">Track form submissions, phone calls, and contact requests from organic search</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Revenue Tracking</h3>
              <p className="text-gray-600 text-sm">Monitor sales and revenue directly attributed to SEO traffic and rankings</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">ROI Calculation</h3>
              <p className="text-gray-600 text-sm">Clear return on investment calculations showing SEO profitability</p>
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Intelligence */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Competitive Intelligence</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Position Analysis</h3>
            <p className="text-gray-600">See how you stack up against competitors in search results and identify opportunities to gain market share.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Competitor Tracking</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Visibility share comparison</li>
                <li>• Keyword gap analysis</li>
                <li>• Content strategy insights</li>
                <li>• Backlink opportunity identification</li>
                <li>• Local search performance comparison</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Strategic Insights</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Market opportunity identification</li>
                <li>• Competitive advantage areas</li>
                <li>• Threat assessment and mitigation</li>
                <li>• Best practice recommendations</li>
                <li>• Industry trend analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Plans */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Actionable Recommendations</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Priority Action Items</h3>
            <p className="text-gray-600">Every report includes specific, prioritized recommendations for the next month based on data insights and opportunities.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Implementation Roadmap</h3>
            <p className="text-gray-600">Clear next steps with timelines, expected outcomes, and resource requirements for each recommendation.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Metrics</h3>
            <p className="text-gray-600">Defined KPIs and success criteria for tracking the impact of implemented recommendations.</p>
          </div>
        </div>
      </div>

      {/* Report Delivery */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Report Delivery & Review</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Schedule</h3>
            <p className="text-gray-600">Reports delivered by the 5th of each month covering the previous month's performance, with optional review calls to discuss findings.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Delivery Options</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDF reports via email</li>
                <li>• Online dashboard access</li>
                <li>• Presentation format for meetings</li>
                <li>• White-label reports for agencies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Review Process</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Optional monthly review calls</li>
                <li>• Q&A sessions for clarification</li>
                <li>• Strategy planning discussions</li>
                <li>• Goal setting and adjustment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">SEO Reporting Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
            <p className="text-gray-600 font-medium">Client Satisfaction Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
            <p className="text-gray-600 font-medium">Better Strategy Alignment</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">60%</div>
            <p className="text-gray-600 font-medium">Faster Decision Making</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
            <p className="text-gray-600 font-medium">Improved ROI Tracking</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Get Clear SEO Insights
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop wondering if your SEO is working. Get detailed monthly reports that show 
          exactly how your search visibility is improving and driving business results.
        </p>
        <button className="bg-white text-green-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-green-700 uppercase tracking-wide text-sm inline-flex items-center">
          Get My SEO Reports
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SEOReporting;
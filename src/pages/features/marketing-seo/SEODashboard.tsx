import React from 'react';
import { CheckCircle, ArrowRight, BarChart3, Eye, Zap } from 'lucide-react';

const SEODashboard = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          SEO Dashboard
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Real-time analytics and SEO performance metrics in one unified dashboard. 
          Monitor your search visibility, track progress, and make data-driven decisions instantly.
        </p>
      </div>

      {/* Why SEO Dashboard Matters */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Real-Time SEO Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Eye className="h-6 w-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Visibility</h3>
              <p className="text-gray-600 text-sm">See your SEO performance at a glance without waiting for monthly reports</p>
            </div>
          </div>
          <div className="flex items-start">
            <Zap className="h-6 w-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Decisions</h3>
              <p className="text-gray-600 text-sm">Spot issues and opportunities immediately to stay ahead of competitors</p>
            </div>
          </div>
          <div className="flex items-start">
            <BarChart3 className="h-6 w-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Data-Driven Strategy</h3>
              <p className="text-gray-600 text-sm">Make informed decisions based on real-time performance data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Comprehensive SEO Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Real-time keyword ranking positions',
            'Organic traffic trends and analytics',
            'Search visibility score and improvements',
            'Competitor ranking comparison',
            'Technical SEO health monitoring',
            'Backlink profile growth tracking',
            'Local search performance metrics',
            'Content performance analysis',
            'Conversion tracking and goal monitoring',
            'Page speed and Core Web Vitals',
            'Mobile usability scores',
            'Search console integration and alerts'
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Overview</h3>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 mb-3">High-level metrics that matter most to your business:</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">1,247</div>
                  <p className="text-sm text-gray-600">Monthly Organic Visitors</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">23</div>
                  <p className="text-sm text-gray-600">Page 1 Rankings</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">85%</div>
                  <p className="text-sm text-gray-600">SEO Health Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">+15%</div>
                  <p className="text-sm text-gray-600">Monthly Growth</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Keyword Performance</h3>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 mb-3">Track your most important keywords in real-time:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Current ranking positions with change indicators</li>
                <li>• Search volume and traffic potential</li>
                <li>• Competitor comparison for each keyword</li>
                <li>• Ranking history and trend analysis</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Traffic Analytics</h3>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 mb-3">Detailed organic traffic insights:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Daily, weekly, and monthly traffic trends</li>
                <li>• Top performing pages and content</li>
                <li>• User behavior and engagement metrics</li>
                <li>• Conversion tracking and goal completions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Alerts */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Smart Alerts & Notifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ranking Alerts</h3>
            <ul className="space-y-2">
              {[
                'Immediate notification when rankings drop significantly',
                'Alerts when keywords enter top 10 or top 3',
                'Competitor movement notifications',
                'New keyword opportunity alerts',
                'SERP feature appearance notifications'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Alerts</h3>
            <ul className="space-y-2">
              {[
                'Website downtime and accessibility issues',
                'Page speed performance degradation',
                'Technical SEO errors and warnings',
                'Security and SSL certificate issues',
                'Search console error notifications'
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

      {/* Competitive Intelligence */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Competitive Intelligence Dashboard</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Position Tracking</h3>
            <p className="text-gray-600">See how you stack up against competitors in real-time with side-by-side comparisons and market share analysis.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Visibility Share</h3>
              <p className="text-gray-600 text-sm">Your share of search visibility compared to competitors</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Keyword Gaps</h3>
              <p className="text-gray-600 text-sm">Keywords competitors rank for that you don't</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Opportunities</h3>
              <p className="text-gray-600 text-sm">Quick wins and strategic opportunities identified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dashboard */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Mobile-Optimized Dashboard</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Anywhere</h3>
            <p className="text-gray-600">Fully responsive dashboard that works perfectly on phones and tablets. Check your SEO performance on the go.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Mobile Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Touch-optimized interface</li>
                <li>• Quick metric cards for easy scanning</li>
                <li>• Swipe navigation between sections</li>
                <li>• Offline data caching</li>
                <li>• Push notifications for alerts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• One-tap ranking checks</li>
                <li>• Instant competitor comparisons</li>
                <li>• Quick report sharing</li>
                <li>• Emergency alert responses</li>
                <li>• Voice search for metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Customization */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Customizable Dashboard</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Views</h3>
            <p className="text-gray-600">Customize your dashboard to show the metrics that matter most to your business goals and role.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Widget Configuration</h3>
            <p className="text-gray-600">Drag and drop widgets, resize sections, and create multiple dashboard views for different stakeholders.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">White Label Options</h3>
            <p className="text-gray-600">For agencies: fully branded dashboards with your logo and colors for client presentations.</p>
          </div>
        </div>
      </div>

      {/* Integration */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Seamless Integrations</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connected Data Sources</h3>
            <p className="text-gray-600">Your dashboard pulls data from all major SEO and analytics platforms for a complete picture.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Analytics Platforms</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Google Analytics 4</li>
                <li>• Google Search Console</li>
                <li>• Google My Business</li>
                <li>• Bing Webmaster Tools</li>
                <li>• Social media analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Business Tools</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• CRM systems</li>
                <li>• Email marketing platforms</li>
                <li>• Call tracking software</li>
                <li>• E-commerce platforms</li>
                <li>• Project management tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Dashboard Impact Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">75%</div>
            <p className="text-gray-600 font-medium">Faster Issue Detection</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">50%</div>
            <p className="text-gray-600 font-medium">Quicker Decision Making</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">90%</div>
            <p className="text-gray-600 font-medium">Better Data Visibility</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">35%</div>
            <p className="text-gray-600 font-medium">Improved SEO ROI</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Get Real-Time SEO Intelligence
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop waiting for monthly reports to see how your SEO is performing. 
          Get instant access to all your SEO metrics in one powerful dashboard.
        </p>
        <button className="bg-white text-indigo-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-indigo-700 uppercase tracking-wide text-sm inline-flex items-center">
          Access My SEO Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SEODashboard;
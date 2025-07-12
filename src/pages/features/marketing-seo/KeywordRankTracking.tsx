import React from 'react';
import { CheckCircle, ArrowRight, TrendingUp, Target, BarChart3 } from 'lucide-react';

const KeywordRankTracking = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Keyword Rank Tracking
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Monitor your search engine rankings for important keywords. 
          Know where you stand vs competitors and track the impact of your SEO efforts over time.
        </p>
      </div>

      {/* Why Rank Tracking Matters */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why Keyword Rankings Matter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <TrendingUp className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Visibility Impact</h3>
              <p className="text-gray-600 text-sm">75% of users never scroll past the first page of search results</p>
            </div>
          </div>
          <div className="flex items-start">
            <Target className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Traffic Correlation</h3>
              <p className="text-gray-600 text-sm">The #1 result gets 31.7% of all clicks, #2 gets 24.7%, #3 gets 18.7%</p>
            </div>
          </div>
          <div className="flex items-start">
            <BarChart3 className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">ROI Measurement</h3>
              <p className="text-gray-600 text-sm">Track the direct impact of your SEO investment on search visibility</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Comprehensive Rank Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Daily ranking updates for all target keywords',
            'Local and national ranking variations',
            'Mobile vs desktop ranking differences',
            'Competitor ranking comparison and analysis',
            'SERP feature tracking (featured snippets, local pack)',
            'Historical ranking data and trend analysis',
            'Keyword difficulty and opportunity scoring',
            'Search volume and traffic potential estimates',
            'Ranking distribution across multiple locations',
            'Voice search ranking optimization',
            'Long-tail keyword discovery and tracking',
            'Seasonal ranking pattern identification'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyword Strategy */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Strategic Keyword Selection</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Primary Keywords</h3>
            <p className="text-gray-600">High-volume, high-intent keywords that directly relate to your main services. These are your money keywords that drive the most valuable traffic.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Service Keywords</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "plumber near me"</li>
                <li>• "emergency plumbing services"</li>
                <li>• "water heater repair"</li>
                <li>• "drain cleaning service"</li>
                <li>• "bathroom remodeling"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Local Keywords</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "plumber in [city name]"</li>
                <li>• "[city] plumbing company"</li>
                <li>• "best plumber [neighborhood]"</li>
                <li>• "[city] emergency plumber"</li>
                <li>• "plumbing services [zip code]"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Competitor Ranking Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Competitive Intelligence</h3>
            <ul className="space-y-2">
              {[
                'Track up to 10 competitors for each keyword',
                'Identify keywords where competitors outrank you',
                'Discover new keyword opportunities from competitors',
                'Monitor competitor ranking changes and strategies',
                'Gap analysis to find untapped opportunities'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Share Analysis</h3>
            <ul className="space-y-2">
              {[
                'Visibility share compared to competitors',
                'Traffic potential analysis by keyword',
                'Competitive landscape mapping',
                'Market opportunity identification',
                'Benchmark performance against industry leaders'
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

      {/* Reporting Dashboard */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Ranking Reports & Dashboard</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Dashboard</h3>
            <p className="text-gray-600">Live dashboard showing current rankings, recent changes, and trending keywords. See your SEO progress at a glance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Ranking Trends</h3>
              <p className="text-gray-600 text-sm">Visual charts showing ranking improvements over time</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Keyword Performance</h3>
              <p className="text-gray-600 text-sm">Detailed analysis of each keyword's ranking history</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Competitive Analysis</h3>
              <p className="text-gray-600 text-sm">Side-by-side comparison with your main competitors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Local Tracking */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Local Search Tracking</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Location-Specific Rankings</h3>
            <p className="text-gray-600">Track rankings from different geographic locations to see how you perform in various service areas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Multi-Location Tracking</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• City-level ranking variations</li>
                <li>• Neighborhood-specific results</li>
                <li>• Service area coverage analysis</li>
                <li>• Local pack ranking positions</li>
                <li>• Google My Business visibility</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Local SEO Insights</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Local citation impact on rankings</li>
                <li>• Review signals and ranking correlation</li>
                <li>• NAP consistency effects</li>
                <li>• Local content performance</li>
                <li>• Proximity factor analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Actionable SEO Insights</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ranking Opportunities</h3>
            <p className="text-gray-600">Identify keywords where you're ranking on page 2 or 3 that could be pushed to page 1 with focused optimization efforts.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Gaps</h3>
            <p className="text-gray-600">Discover keywords your competitors rank for that you don't, revealing content opportunities and new service areas to target.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimization Priorities</h3>
            <p className="text-gray-600">Get specific recommendations on which keywords to focus on based on ranking potential, search volume, and business value.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Rank Tracking Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">150%</div>
            <p className="text-gray-600 font-medium">Increase in Page 1 Rankings</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
            <p className="text-gray-600 font-medium">More Organic Traffic</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">60%</div>
            <p className="text-gray-600 font-medium">Higher Click-Through Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">40%</div>
            <p className="text-gray-600 font-medium">More Qualified Leads</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Track Your SEO Success
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop guessing about your search rankings. Get detailed tracking and insights 
          that show exactly where you stand and how to improve your visibility.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-blue-700 uppercase tracking-wide text-sm inline-flex items-center">
          Start Tracking Rankings
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default KeywordRankTracking;
import React from 'react';
import { CheckCircle, ArrowRight, Search, TrendingUp, Target } from 'lucide-react';

const SEOAddon = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          SEO Addon
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Comprehensive SEO package to boost your search rankings and organic traffic. 
          Get found by customers actively searching for your services with our proven SEO strategies.
        </p>
      </div>

      {/* Why SEO Addon Matters */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why SEO Is Essential for Your Business</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Search className="h-6 w-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Customer Intent</h3>
              <p className="text-gray-600 text-sm">People searching for your services are ready to buy - capture that high-intent traffic</p>
            </div>
          </div>
          <div className="flex items-start">
            <TrendingUp className="h-6 w-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Long-term Growth</h3>
              <p className="text-gray-600 text-sm">SEO builds momentum over time - invest once, benefit for years</p>
            </div>
          </div>
          <div className="flex items-start">
            <Target className="h-6 w-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cost-Effective</h3>
              <p className="text-gray-600 text-sm">Organic traffic is free traffic - no ongoing ad spend required</p>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Services */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Complete SEO Package</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Comprehensive keyword research and strategy',
            'On-page optimization for all website pages',
            'Technical SEO audits and improvements',
            'Local SEO optimization and Google My Business',
            'Content creation and optimization',
            'Link building and authority development',
            'Competitor analysis and gap identification',
            'Monthly ranking and traffic reporting',
            'Google Analytics and Search Console setup',
            'Schema markup implementation',
            'Site speed optimization',
            'Mobile SEO optimization'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SEO Process */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Our Proven SEO Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Research & Analysis</h3>
            <p className="text-gray-600 text-sm">Keyword research, competitor analysis, and technical audit</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Strategy Development</h3>
            <p className="text-gray-600 text-sm">Custom SEO strategy based on your business goals</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Implementation</h3>
            <p className="text-gray-600 text-sm">Execute on-page, technical, and content optimizations</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-600">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Monitor & Optimize</h3>
            <p className="text-gray-600 text-sm">Track results and continuously improve performance</p>
          </div>
        </div>
      </div>

      {/* Local SEO Focus */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Local SEO Specialization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Google My Business Optimization</h3>
            <ul className="space-y-2">
              {[
                'Complete profile setup and optimization',
                'Regular posts and updates',
                'Review management and responses',
                'Photo optimization and virtual tours',
                'Q&A monitoring and management'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Local Citations & Directories</h3>
            <ul className="space-y-2">
              {[
                'NAP consistency across all platforms',
                'Local directory submissions',
                'Industry-specific listings',
                'Citation cleanup and management',
                'Local link building opportunities'
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

      {/* Content Strategy */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">SEO Content Strategy</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Keyword-Optimized Content</h3>
            <p className="text-gray-600">Create valuable content that ranks well and serves your customers. We focus on topics your potential customers are actually searching for.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Service Pages</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Detailed service descriptions</li>
                <li>• Local keyword optimization</li>
                <li>• Customer testimonials</li>
                <li>• Clear calls-to-action</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Blog Content</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• How-to guides and tips</li>
                <li>• Industry insights</li>
                <li>• Local community content</li>
                <li>• Seasonal topics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location Pages</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• City-specific landing pages</li>
                <li>• Local area information</li>
                <li>• Service area coverage</li>
                <li>• Local testimonials</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Technical SEO */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Technical SEO Excellence</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Behind-the-Scenes Optimization</h3>
            <p className="text-gray-600">Technical SEO ensures search engines can properly crawl, understand, and rank your website.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Site Structure</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• XML sitemap optimization</li>
                <li>• URL structure improvement</li>
                <li>• Internal linking strategy</li>
                <li>• Navigation optimization</li>
                <li>• Breadcrumb implementation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Page speed optimization</li>
                <li>• Core Web Vitals improvement</li>
                <li>• Mobile responsiveness</li>
                <li>• Image optimization</li>
                <li>• Caching implementation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Reporting & Analytics */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Transparent Reporting</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly SEO Reports</h3>
            <p className="text-gray-600">Detailed reports showing your progress, wins, and next steps. See exactly how your investment is paying off.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Keyword ranking improvements</li>
                <li>• Organic traffic growth</li>
                <li>• Local search visibility</li>
                <li>• Conversion tracking</li>
                <li>• Competitor comparison</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Business Impact</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Lead generation from SEO</li>
                <li>• Phone calls from search</li>
                <li>• Revenue attribution</li>
                <li>• ROI calculations</li>
                <li>• Growth projections</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline & Expectations */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">SEO Timeline & Expectations</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Realistic Timeline</h3>
            <p className="text-gray-600">SEO is a long-term strategy that builds momentum over time. Here's what to expect:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Months 1-3</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Technical improvements</li>
                <li>• Content optimization</li>
                <li>• Local SEO setup</li>
                <li>• Initial ranking improvements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Months 4-6</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Significant ranking gains</li>
                <li>• Increased organic traffic</li>
                <li>• More local visibility</li>
                <li>• Higher conversion rates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Months 6+</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Dominant local presence</li>
                <li>• Consistent lead generation</li>
                <li>• Strong ROI demonstration</li>
                <li>• Ongoing optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">SEO Addon Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">200%</div>
            <p className="text-gray-600 font-medium">Increase in Organic Traffic</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">150%</div>
            <p className="text-gray-600 font-medium">More Page 1 Rankings</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">75%</div>
            <p className="text-gray-600 font-medium">Increase in Local Visibility</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">300%</div>
            <p className="text-gray-600 font-medium">ROI on SEO Investment</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Dominate Your Local Search Results
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop losing customers to competitors who show up first in search results. 
          Get our proven SEO addon and start ranking higher for the keywords that matter.
        </p>
        <button className="bg-white text-orange-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-orange-700 uppercase tracking-wide text-sm inline-flex items-center">
          Add SEO to My Package
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SEOAddon;
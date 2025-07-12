import React from 'react';
import { CheckCircle, ArrowRight, MapPin, Search, TrendingUp } from 'lucide-react';

const LocalSearchVisibility = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Local Search Visibility
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Optimize your presence for local searches and Google My Business. 
          Show up when customers search nearby and dominate your local market online.
        </p>
      </div>

      {/* Why Local SEO Matters */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Dominate Local Search Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <MapPin className="h-6 w-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Local Intent</h3>
              <p className="text-gray-600 text-sm">46% of all Google searches are looking for local information</p>
            </div>
          </div>
          <div className="flex items-start">
            <Search className="h-6 w-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Mobile Searches</h3>
              <p className="text-gray-600 text-sm">76% of people who search for something nearby visit a business within 24 hours</p>
            </div>
          </div>
          <div className="flex items-start">
            <TrendingUp className="h-6 w-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Conversion Rate</h3>
              <p className="text-gray-600 text-sm">Local searches have a 50% higher conversion rate than general searches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Local SEO Services */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Complete Local SEO Optimization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Google My Business optimization and management',
            'Local keyword research and targeting',
            'NAP (Name, Address, Phone) consistency across the web',
            'Local directory submissions and citations',
            'Location-specific landing pages',
            'Local schema markup implementation',
            'Google Maps optimization and ranking',
            'Local review management and response',
            'Competitor analysis and gap identification',
            'Local link building and partnerships',
            'Mobile optimization for local searches',
            'Voice search optimization for local queries'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Google My Business */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Google My Business Optimization</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Profile Setup</h3>
            <p className="text-gray-600">Optimize every section of your Google My Business profile with accurate information, compelling descriptions, and high-quality photos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Profile Elements</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Business name, address, and phone number</li>
                <li>• Business hours and holiday schedules</li>
                <li>• Service areas and location details</li>
                <li>• Business categories and attributes</li>
                <li>• Professional photos and virtual tours</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Ongoing Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Regular posts and updates</li>
                <li>• Q&A monitoring and responses</li>
                <li>• Review management and replies</li>
                <li>• Performance tracking and optimization</li>
                <li>• Special offers and event promotion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Local Keywords */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Local Keyword Strategy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Target Keywords</h3>
            <ul className="space-y-2">
              {[
                'Service + City combinations ("plumber Chicago")',
                'Near me searches ("restaurants near me")',
                'Neighborhood-specific terms',
                'Local landmarks and areas',
                'Emergency and urgent local services'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Content Optimization</h3>
            <ul className="space-y-2">
              {[
                'Location pages for each service area',
                'Local landing pages with city-specific content',
                'Blog posts about local events and news',
                'Customer testimonials with location mentions',
                'Service area descriptions and coverage maps'
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

      {/* Citations & Directories */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Local Citations & Directory Listings</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">NAP Consistency</h3>
            <p className="text-gray-600">Ensure your business Name, Address, and Phone number are identical across all online directories and platforms. Inconsistencies hurt local rankings.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Major Directories</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Google My Business</li>
                <li>• Bing Places</li>
                <li>• Apple Maps</li>
                <li>• Facebook Business</li>
                <li>• Yelp</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Industry Directories</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Better Business Bureau</li>
                <li>• Angie's List</li>
                <li>• HomeAdvisor</li>
                <li>• Industry-specific platforms</li>
                <li>• Professional associations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Local Directories</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Chamber of Commerce</li>
                <li>• Local business associations</li>
                <li>• City and county websites</li>
                <li>• Local news websites</li>
                <li>• Community directories</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Local Link Building */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Local Link Building Strategy</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Partnerships</h3>
            <p className="text-gray-600">Build relationships with local organizations, charities, and businesses to earn high-quality local backlinks.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Link Opportunities</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Local business partnerships</li>
                <li>• Community event sponsorships</li>
                <li>• Local charity involvement</li>
                <li>• Chamber of Commerce membership</li>
                <li>• Local media and press coverage</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Content Strategies</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Local expert interviews</li>
                <li>• Community event coverage</li>
                <li>• Local business spotlights</li>
                <li>• Area guide creation</li>
                <li>• Local resource pages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Results Tracking */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Local SEO Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">150%</div>
            <p className="text-gray-600 font-medium">Increase in Local Visibility</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">75%</div>
            <p className="text-gray-600 font-medium">More Local Traffic</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">60%</div>
            <p className="text-gray-600 font-medium">Increase in Phone Calls</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
            <p className="text-gray-600 font-medium">More Store Visits</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Dominate Your Local Market
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop losing customers to competitors who show up first in local searches. 
          Get found by customers in your area who are ready to buy.
        </p>
        <button className="bg-white text-orange-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-orange-700 uppercase tracking-wide text-sm inline-flex items-center">
          Boost My Local Visibility
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default LocalSearchVisibility;
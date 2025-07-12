import React from 'react';
import { CheckCircle, ArrowRight, Star, ThumbsUp, MessageSquare } from 'lucide-react';

const AutomatedReviewRequests = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Automated Review Requests
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Smart timing for review requests when customers are happiest. 
          Get more 5-star reviews that boost your credibility and attract new customers automatically.
        </p>
      </div>

      {/* Why Reviews Matter */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">The Power of Online Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Star className="h-6 w-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Trust Factor</h3>
              <p className="text-gray-600 text-sm">93% of consumers read reviews before making a purchase decision</p>
            </div>
          </div>
          <div className="flex items-start">
            <ThumbsUp className="h-6 w-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">SEO Benefits</h3>
              <p className="text-gray-600 text-sm">Businesses with more reviews rank higher in local search results</p>
            </div>
          </div>
          <div className="flex items-start">
            <MessageSquare className="h-6 w-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Revenue Impact</h3>
              <p className="text-gray-600 text-sm">A 1-star increase can boost revenue by 5-9%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Request Strategy */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Smart Review Request Strategy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Perfect timing when customers are most satisfied',
            'Multiple platform requests (Google, Facebook, Yelp)',
            'Personalized messages that feel genuine',
            'Easy one-click review links',
            'Follow-up reminders for non-responders',
            'Automatic thank you messages for reviewers',
            'Problem resolution before review requests',
            'Staff notification system for review monitoring',
            'Review response templates for consistency',
            'Negative review alerts for immediate response',
            'Review analytics and performance tracking',
            'Integration with your customer database'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timing Strategy */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Perfect Timing for Review Requests</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Businesses</h3>
            <p className="text-gray-600 mb-3">Request reviews 2-3 days after service completion when the positive experience is fresh but any minor issues have been resolved.</p>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-700">"Hi [Name]! How did everything go with your [service] on [date]? If you were happy with our work, would you mind leaving us a quick review? It really helps our small business. Thanks! - [Your Name]"</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Retail/E-commerce</h3>
            <p className="text-gray-600 mb-3">Wait 7-14 days after purchase so customers have time to use the product and form an opinion.</p>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-700">"Hi [Name]! You purchased [product] from us a couple weeks ago. How are you liking it? If you're happy with your purchase, we'd love a review! Takes just 30 seconds: [link]"</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Services</h3>
            <p className="text-gray-600 mb-3">Request immediately after achieving a positive outcome or milestone for the client.</p>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-700">"Congratulations on [achievement/outcome]! We're so glad we could help. If you had a positive experience working with us, would you consider sharing it in a review? It means the world to us. [link]"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Platform Strategy */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Multi-Platform Review Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Primary Platforms</h3>
            <ul className="space-y-2">
              {[
                'Google My Business (most important for SEO)',
                'Facebook Reviews (social proof)',
                'Yelp (consumer research platform)',
                'Better Business Bureau (trust factor)',
                'Industry-specific platforms'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Distribution</h3>
            <ul className="space-y-2">
              {[
                'Rotate platforms to build diverse presence',
                'Target Google for local customers',
                'Focus on Facebook for social audiences',
                'Use Yelp for restaurant/retail businesses',
                'Custom requests based on customer demographics'
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

      {/* Problem Prevention */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Preventing Negative Reviews</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Two-Step Process</h3>
            <p className="text-gray-600">Before asking for public reviews, we first ask customers about their satisfaction privately. If they indicate any issues, we address them first.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Step 1: Satisfaction Check</h4>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700">"Hi [Name]! How was your experience with [service/product]? Rate 1-10:"</p>
                <ul className="text-xs text-gray-600 mt-2">
                  <li>• 9-10: Direct to public review</li>
                  <li>• 7-8: Ask what could be improved</li>
                  <li>• 1-6: Internal follow-up to resolve issues</li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Step 2: Action Based on Response</h4>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700">Happy customers → Review request<br />
                Neutral customers → Improvement discussion<br />
                Unhappy customers → Problem resolution</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results & Analytics */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Review Generation Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">300%</div>
            <p className="text-gray-600 font-medium">More Reviews Generated</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
            <p className="text-gray-600 font-medium">5-Star Review Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
            <p className="text-gray-600 font-medium">Response Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">15%</div>
            <p className="text-gray-600 font-medium">New Customer Increase</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Build Your 5-Star Reputation
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop hoping for reviews and start generating them systematically. 
          Get more positive reviews that attract customers and boost your credibility.
        </p>
        <button className="bg-white text-orange-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-orange-700 uppercase tracking-wide text-sm inline-flex items-center">
          Start Getting More Reviews
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AutomatedReviewRequests;
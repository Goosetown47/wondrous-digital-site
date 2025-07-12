import React from 'react';
import { CheckCircle, ArrowRight, MessageSquare, TrendingUp, Heart } from 'lucide-react';

const SurveysFeedback = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Surveys & Feedback
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Automated surveys to gather feedback and improve customer satisfaction. 
          Turn happy customers into loyal advocates and address issues before they become problems.
        </p>
      </div>

      {/* Why Feedback Matters */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">The Power of Customer Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Heart className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Loyalty</h3>
              <p className="text-gray-600 text-sm">Customers who feel heard are 5x more likely to become repeat customers</p>
            </div>
          </div>
          <div className="flex items-start">
            <TrendingUp className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Improve Service</h3>
              <p className="text-gray-600 text-sm">Identify areas for improvement before small issues become big problems</p>
            </div>
          </div>
          <div className="flex items-start">
            <MessageSquare className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Generate Reviews</h3>
              <p className="text-gray-600 text-sm">Happy survey respondents are 3x more likely to leave positive reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Types */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Automated Survey Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Post-service satisfaction surveys',
            'Net Promoter Score (NPS) tracking',
            'Customer effort score measurements',
            'Product/service feedback forms',
            'Annual customer satisfaction surveys',
            'Event feedback and evaluation forms',
            'Website user experience surveys',
            'Support ticket resolution surveys',
            'Onboarding experience feedback',
            'Cancellation exit interviews',
            'Feature request and suggestion forms',
            'Market research and preference surveys'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Survey Examples */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Sample Survey Flows</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Post-Service Satisfaction Survey</h3>
            <div className="bg-white p-4 rounded-lg space-y-3">
              <div>
                <strong>Question 1:</strong> How satisfied were you with our service today? (1-10 scale)
                <p className="text-sm text-gray-600">• 9-10: Direct to review request</p>
                <p className="text-sm text-gray-600">• 7-8: Ask for improvement suggestions</p>
                <p className="text-sm text-gray-600">• 1-6: Immediate follow-up from manager</p>
              </div>
              <div>
                <strong>Question 2:</strong> How likely are you to recommend us to a friend? (NPS)
              </div>
              <div>
                <strong>Question 3:</strong> What could we have done better?
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Effort Score Survey</h3>
            <div className="bg-white p-4 rounded-lg space-y-3">
              <div>
                <strong>Question 1:</strong> How easy was it to get your issue resolved today?
                <p className="text-sm text-gray-600">• Very Easy • Easy • Neutral • Difficult • Very Difficult</p>
              </div>
              <div>
                <strong>Question 2:</strong> How many times did you have to contact us?
              </div>
              <div>
                <strong>Question 3:</strong> What would have made this process easier?
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Intelligent Survey Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Timing</h3>
            <ul className="space-y-2">
              {[
                'Send surveys when customers are most satisfied',
                'Avoid survey fatigue with intelligent spacing',
                'Time-based triggers (24 hours after service)',
                'Behavior-based triggers (after positive interaction)',
                'Seasonal surveys for annual feedback'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Response Actions</h3>
            <ul className="space-y-2">
              {[
                'Automatic escalation for negative feedback',
                'Thank you messages for positive responses',
                'Review requests for satisfied customers',
                'Follow-up surveys for improvement tracking',
                'Team notifications for urgent issues'
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

      {/* Feedback Analysis */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Feedback Analytics & Insights</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sentiment Analysis</h3>
            <p className="text-gray-600">Automatically analyze open-ended responses to identify positive, negative, and neutral sentiment. Spot trends and issues before they escalate.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trend Tracking</h3>
            <p className="text-gray-600">Monitor satisfaction scores over time, identify seasonal patterns, and track the impact of service improvements on customer happiness.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Actionable Reports</h3>
            <p className="text-gray-600">Get monthly reports highlighting key insights, improvement opportunities, and customer success stories to share with your team.</p>
          </div>
        </div>
      </div>

      {/* Response Management */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Negative Feedback Response System</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Immediate Alerts</h3>
            <p className="text-gray-600">Get instant notifications when customers report dissatisfaction so you can address issues quickly.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recovery Workflows</h3>
            <p className="text-gray-600">Automatic workflows guide your team through service recovery steps to turn unhappy customers into loyal advocates.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow-up Tracking</h3>
            <p className="text-gray-600">Track resolution efforts and send follow-up surveys to ensure customer satisfaction has been restored.</p>
          </div>
        </div>
      </div>

      {/* Results Metrics */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Survey Program Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">35%</div>
            <p className="text-gray-600 font-medium">Higher Response Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
            <p className="text-gray-600 font-medium">Increase in Satisfaction</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">50%</div>
            <p className="text-gray-600 font-medium">Faster Issue Resolution</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">3x</div>
            <p className="text-gray-600 font-medium">More Positive Reviews</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Turn Feedback Into Business Growth
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Stop guessing what customers think. Get systematic feedback that helps you 
          improve service, build loyalty, and generate more positive reviews.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-blue-700 uppercase tracking-wide text-sm inline-flex items-center">
          Start Collecting Feedback
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SurveysFeedback;
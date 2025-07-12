import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Zap, ArrowRight } from 'lucide-react';

const AIAutomationOverview = () => {
  const features = [
    {
      name: 'AI Phone Receptionist',
      slug: 'ai-phone-receptionist',
      description: 'Friendly AI voice that answers calls 24/7, books appointments, and handles common questions',
      benefit: 'Never miss a potential customer again'
    },
    {
      name: 'SMS & Email Follow-ups',
      slug: 'sms-email-followups',
      description: 'Automatic text and email sequences that nurture leads and keep customers engaged',
      benefit: '70% of missed calls convert with instant follow-up'
    },
    {
      name: 'Multi-Channel Drip Systems',
      slug: 'multi-channel-drip-systems',
      description: 'Coordinated messaging across text, email, and social media to stay top-of-mind',
      benefit: 'Consistent touchpoints increase conversion by 80%'
    },
    {
      name: 'Conversational AI Chat',
      slug: 'conversational-ai-chat',
      description: 'Smart chatbot that answers questions and captures leads on your website',
      benefit: 'Convert visitors while you sleep'
    },
    {
      name: 'Automated Workflows',
      slug: 'automated-workflows',
      description: 'Custom automation sequences triggered by customer actions and behaviors',
      benefit: 'Save 15+ hours per week on repetitive tasks'
    },
    {
      name: 'Missed Call Text Backs',
      slug: 'missed-call-text-backs',
      description: 'Instant text messages sent when you miss a call, keeping leads warm',
      benefit: 'Turn missed calls into booked appointments'
    },
    {
      name: 'Automated Review Requests',
      slug: 'automated-review-requests',
      description: 'Smart timing for review requests when customers are happiest',
      benefit: 'More 5-star reviews boost credibility'
    }
  ];

  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white mr-4">
            <Bot className="h-8 w-8" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-display" style={{ color: 'rgb(31, 10, 66)' }}>
            AI & Automation
          </h1>
        </div>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Intelligent automation that works around the clock to capture leads, nurture customers, 
          and handle routine tasks so you can focus on growing your business.
        </p>
      </div>

      {/* Key Benefits */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">The Power of Automation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Zap className="h-6 w-6 text-purple-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Response Time</h3>
              <p className="text-gray-600 text-sm">Respond to leads in seconds, not hours. Speed beats perfect every time in sales.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Zap className="h-6 w-6 text-purple-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Availability</h3>
              <p className="text-gray-600 text-sm">Your business never sleeps. Capture leads and serve customers around the clock.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Zap className="h-6 w-6 text-purple-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consistent Follow-up</h3>
              <p className="text-gray-600 text-sm">Never forget to follow up again. Automation ensures no lead falls through the cracks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Automation Features</h2>
        {features.map((feature) => (
          <Link
            key={feature.slug}
            to={`/features/ai-automation/${feature.slug}`}
            className="group block"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-premium transition-all duration-300 hover:border-purple-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm text-purple-600">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                    {feature.benefit}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200 ml-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Ready to Automate Your Business?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          See how AI and automation can save you hours every week while growing your customer base. 
          Book a demonstration today.
        </p>
        <button className="bg-white text-purple-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-purple-700 uppercase tracking-wide text-sm">
          See Automation in Action
        </button>
      </div>
    </div>
  );
};

export default AIAutomationOverview;
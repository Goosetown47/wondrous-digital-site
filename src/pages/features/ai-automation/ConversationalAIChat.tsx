import React from 'react';
import { CheckCircle, ArrowRight, MessageCircle, Zap, Users } from 'lucide-react';

const ConversationalAIChat = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Conversational AI Chat
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Smart chatbot that engages website visitors in natural conversations, answers questions instantly, 
          and captures leads even when you're not available. Turn browsers into buyers 24/7.
        </p>
      </div>

      {/* Why AI Chat Matters */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Capture Leads While You Sleep</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Zap className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Response</h3>
              <p className="text-gray-600 text-sm">Visitors get answers immediately instead of waiting for business hours</p>
            </div>
          </div>
          <div className="flex items-start">
            <Users className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Availability</h3>
              <p className="text-gray-600 text-sm">Never miss a potential customer, even at 2 AM or during holidays</p>
            </div>
          </div>
          <div className="flex items-start">
            <MessageCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Natural Conversations</h3>
              <p className="text-gray-600 text-sm">Advanced AI understands context and responds like a real person</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Capabilities */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">What Your AI Chat Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Answer frequently asked questions instantly',
            'Provide pricing and service information',
            'Schedule appointments and consultations',
            'Collect contact information from visitors',
            'Guide customers through your services',
            'Qualify leads with smart questioning',
            'Transfer to human agents when needed',
            'Handle multiple conversations simultaneously',
            'Remember previous interactions with customers',
            'Provide personalized recommendations',
            'Send follow-up messages after chat ends',
            'Integrate with your CRM and calendar'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation Flow Examples */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Sample Conversations</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Inquiry</h3>
            <div className="space-y-3">
              <div className="bg-blue-100 p-3 rounded-lg max-w-md">
                <p className="text-sm"><strong>Visitor:</strong> "Do you offer emergency plumbing services?"</p>
              </div>
              <div className="bg-white p-3 rounded-lg max-w-md ml-auto">
                <p className="text-sm"><strong>AI:</strong> "Yes! We provide 24/7 emergency plumbing services. What type of emergency are you dealing with?"</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg max-w-md">
                <p className="text-sm"><strong>Visitor:</strong> "My basement is flooding from a burst pipe!"</p>
              </div>
              <div className="bg-white p-3 rounded-lg max-w-md ml-auto">
                <p className="text-sm"><strong>AI:</strong> "That's urgent! I can get a plumber to you within 30 minutes. Can I get your address and phone number to dispatch someone immediately?"</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Question</h3>
            <div className="space-y-3">
              <div className="bg-blue-100 p-3 rounded-lg max-w-md">
                <p className="text-sm"><strong>Visitor:</strong> "How much does a website redesign cost?"</p>
              </div>
              <div className="bg-white p-3 rounded-lg max-w-md ml-auto">
                <p className="text-sm"><strong>AI:</strong> "Great question! Our website redesigns typically range from $3,000-$15,000 depending on complexity. What type of business are you in? This helps me give you a more accurate estimate."</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Fully Customized for Your Business</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Brand Voice & Personality</h3>
            <ul className="space-y-2">
              {[
                'Matches your brand tone and personality',
                'Uses your business terminology and language',
                'Knows your services, pricing, and policies',
                'Reflects your company values and culture',
                'Customizable greeting and responses'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Integration</h3>
            <ul className="space-y-2">
              {[
                'Connects to your booking system',
                'Updates your CRM automatically',
                'Sends notifications to your team',
                'Works with your existing tools',
                'Mobile-responsive chat widget'
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

      {/* Performance Metrics */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">AI Chat Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">67%</div>
            <p className="text-gray-600 font-medium">Lead Capture Increase</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-gray-600 font-medium">Customer Support</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">3s</div>
            <p className="text-gray-600 font-medium">Average Response Time</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
            <p className="text-gray-600 font-medium">Customer Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Advanced AI Features</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Natural Language Processing</h3>
            <p className="text-gray-600">Understands intent even when customers don't use exact keywords. Can handle complex questions and follow conversation context.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead Scoring</h3>
            <p className="text-gray-600">Automatically qualifies leads based on their questions and behavior, prioritizing hot prospects for immediate follow-up.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sentiment Analysis</h3>
            <p className="text-gray-600">Detects frustrated or urgent customers and can immediately escalate to human support or priority handling.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Continuous Learning</h3>
            <p className="text-gray-600">Gets smarter over time by learning from successful conversations and customer feedback.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Start Converting Visitors 24/7
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Don't let website visitors leave without engaging. Get an AI chatbot that 
          captures leads, answers questions, and books appointments around the clock.
        </p>
        <button className="bg-white text-green-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-green-700 uppercase tracking-wide text-sm inline-flex items-center">
          Add AI Chat to My Site
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ConversationalAIChat;
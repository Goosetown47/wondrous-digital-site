import React from 'react';
import { Check, Star, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const mainPlans = [
    {
      name: "Start",
      price: "$397",
      period: "/month",
      features: [
        "10,000 emails",
        "250 SMS/calls",
        "1,000 AI words",
        "100 premium automation executions",
        "25 workflow AI executions",
        "Unlimited forms/calendar bookings",
        "1 user account"
      ]
    },
    {
      name: "Grow",
      price: "$697",
      period: "/month",
      popular: true,
      features: [
        "20,000 emails",
        "750 SMS/calls",
        "5,000 AI words",
        "500 premium automation executions",
        "150 workflow AI executions",
        "Unlimited forms/calendar bookings",
        "3 user accounts"
      ]
    },
    {
      name: "Scale",
      price: "$997",
      period: "/month",
      features: [
        "45,000 emails",
        "1,500 SMS/calls",
        "10,000 AI words",
        "1,000 premium automation executions",
        "300 workflow AI executions",
        "Unlimited forms/calendar bookings",
        "10 user accounts"
      ]
    }
  ];

  const secondaryInfo = [
    {
      title: "Cancel anytime. No questions asked.",
      description: "All packages have a one time $1,500 platform set up fee."
    },
    {
      title: "Learn about our SEO addon",
      description: "Rank higher organically and drive more traffic to your smart website."
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
            Simple,{' '}
            Usage-Based
            {' '}
            Pricing
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Every package gets all of the marketing, AI features, and a free web design. 
            The difference between them is based on how much you use the platform. That's it.
          </p>
        </div>

        {/* Main Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {mainPlans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl shadow-card hover:shadow-premium transition-all duration-300 transform hover:-translate-y-2 ${
                plan.popular ? 'ring-2 ring-primary-pink scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-pink text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-display text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-primary-pink mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 px-6 rounded-[15px] font-semibold transition-all duration-150 border-2 border-primary-original-dark-purple uppercase tracking-wide text-sm ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-[#F867AC] to-[#3C33C0] text-white shadow-button-primary hover:shadow-button-primary-hover active:translate-x-0.5 active:translate-y-0.5'
                    : 'bg-white text-primary-pink shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5'
                }`}>
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Information Cards - Subtle Background Style with Hover Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {secondaryInfo.map((info, index) => (
            <div 
              key={index}
              className="group bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 hover:shadow-premium transition-all duration-300 flex items-center justify-between cursor-pointer"
            >
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {info.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {info.description}
                </p>
              </div>
              
              <div className="ml-6 flex-shrink-0">
                <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-primary-pink group-hover:bg-primary-pink group-hover:text-white transition-all duration-200">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
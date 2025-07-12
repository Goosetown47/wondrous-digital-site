import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Bot, Users, TrendingUp, Settings, ArrowRight } from 'lucide-react';

const FeaturesOverviewPage = () => {
  const categories = [
    {
      name: 'Websites',
      slug: 'websites',
      icon: Globe,
      description: 'Professional websites with custom domains, security, and hosting - all completely free.',
      features: ['Free Web Design', 'Custom Domains', 'GDPR Compliance', 'HTTPS Certification', 'Top Tier Web Hosting', 'Blogging'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'AI & Automation',
      slug: 'ai-automation',
      icon: Bot,
      description: 'Intelligent automation that works 24/7 to capture leads and nurture customers.',
      features: ['AI Phone Receptionist', 'SMS & Email Follow-ups', 'Multi-Channel Drip Systems', 'Conversational AI Chat', 'Automated Workflows', 'Missed Call Text Backs'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Customer Management',
      slug: 'customer-management',
      icon: Users,
      description: 'Comprehensive tools to manage, track, and grow your customer relationships.',
      features: ['Digital Address Book (CRM)', 'Online Booking Calendar', 'Smart Contact Forms', 'Sales Pipeline', 'Surveys & Feedback', 'Branded Mobile App'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Marketing & SEO',
      slug: 'marketing-seo',
      icon: TrendingUp,
      description: 'Boost your online visibility and drive more qualified traffic to your business.',
      features: ['Local Search Visibility', 'Email Newsletters', 'Post to All Channels', 'Site Audits & Optimization', 'Keyword Rank Tracking', 'SEO Reporting'],
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Our Platforms',
      slug: 'our-platforms',
      icon: Settings,
      description: 'Powerful dashboards and tools that give you complete control over your business growth.',
      features: ['SEO Addon', 'SEO Dashboard', 'Marketing Dashboard', 'Our Mobile App'],
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Features Overview
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Everything you need to automate your business, attract new customers, and save time. 
          Our comprehensive platform handles the busy work so you can focus on what you do best.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {categories.map((category) => {
          const Icon = category.icon;
          
          return (
            <Link
              key={category.slug}
              to={`/features/${category.slug}`}
              className="group block"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-premium transition-all duration-300 transform hover:-translate-y-1">
                {/* Icon and Title */}
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color} text-white mr-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display text-gray-900 group-hover:text-primary-pink transition-colors duration-200">
                      {category.name}
                    </h3>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-pink group-hover:translate-x-1 transition-all duration-200" />
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {category.description}
                </p>

                {/* Feature List */}
                <div className="space-y-2">
                  {category.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-primary-pink rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </div>
                  ))}
                  {category.features.length > 4 && (
                    <div className="text-sm text-primary-pink font-medium pt-2">
                      +{category.features.length - 4} more features
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-pink to-primary-dark-purple rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Ready to see these features in action?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Book a free consultation to learn how our features can transform your business 
          and start generating more customers automatically.
        </p>
        <button className="bg-white text-primary-pink px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-primary-dark-purple uppercase tracking-wide text-sm">
          Book a Free Consultation
        </button>
      </div>
    </div>
  );
};

export default FeaturesOverviewPage;
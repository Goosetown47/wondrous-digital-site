import React from 'react';
import { CheckCircle, ArrowRight, PenTool, Search, Users } from 'lucide-react';

const Blogging = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Blogging
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Built-in blogging platform that helps you share expertise, attract customers through content, 
          and improve your search engine rankings. Establish yourself as the go-to expert in your field.
        </p>
      </div>

      {/* Why Blogging Matters */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why Blogging Grows Your Business</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Search className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">SEO Benefits</h3>
              <p className="text-gray-600 text-sm">Businesses that blog get 97% more links to their website and rank higher on Google</p>
            </div>
          </div>
          <div className="flex items-start">
            <Users className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Authority</h3>
              <p className="text-gray-600 text-sm">Share your expertise and become the trusted source customers turn to for advice</p>
            </div>
          </div>
          <div className="flex items-start">
            <PenTool className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Lead Generation</h3>
              <p className="text-gray-600 text-sm">Companies that blog generate 67% more leads than those that don't</p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Complete Blogging Solution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Easy-to-use blog editor with rich formatting',
            'SEO optimization for each blog post',
            'Automatic social media sharing',
            'Email newsletter integration',
            'Comment system for engagement',
            'Category and tag organization',
            'Search functionality for your blog',
            'Mobile-optimized blog design',
            'Author profiles and bios',
            'Related posts suggestions',
            'Analytics to track blog performance',
            'RSS feed for subscribers'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Strategy */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Content Strategy That Works</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Answer Customer Questions</h3>
            <p className="text-gray-600">Write about common questions customers ask. This helps with SEO and positions you as helpful and knowledgeable.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Behind-the-Scenes</h3>
            <p className="text-gray-600">Show your work process, team, and company culture. People buy from businesses they know and trust.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry News and Trends</h3>
            <p className="text-gray-600">Keep customers informed about changes in your industry and how they might be affected.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Success Stories</h3>
            <p className="text-gray-600">Share how you've helped other customers succeed. Social proof is powerful for converting prospects.</p>
          </div>
        </div>
      </div>

      {/* Blog Benefits */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">How Blogging Attracts Customers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">SEO Impact</h3>
            <ul className="space-y-2">
              {[
                'Fresh content signals search engines',
                'Target long-tail keywords naturally',
                'Build internal links throughout your site',
                'Earn backlinks from other websites',
                'Improve search rankings over time'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Relationship</h3>
            <ul className="space-y-2">
              {[
                'Stay top-of-mind between purchases',
                'Demonstrate expertise and knowledge',
                'Build trust through helpful content',
                'Create emotional connections',
                'Encourage repeat business and referrals'
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

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Start Building Authority Through Content
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Share your expertise, attract qualified leads, and improve your search rankings 
          with a professional blog integrated into your website.
        </p>
        <button className="bg-white text-purple-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-purple-700 uppercase tracking-wide text-sm inline-flex items-center">
          Start My Blog
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Blogging;
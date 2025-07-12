import React from 'react';
import { CheckCircle, ArrowRight, Search, Zap, TrendingUp } from 'lucide-react';

const SiteAuditsOptimization = () => {
  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
          Site Audits & Optimization
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Regular website analysis and improvements for better performance. 
          Keep your site fast, secure, and optimized for search engines with ongoing maintenance and updates.
        </p>
      </div>

      {/* Why Site Audits Matter */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Why Regular Site Audits Are Critical</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Search className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">SEO Performance</h3>
              <p className="text-gray-600 text-sm">Technical issues can hurt your search rankings without you knowing</p>
            </div>
          </div>
          <div className="flex items-start">
            <Zap className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Site Speed</h3>
              <p className="text-gray-600 text-sm">Slow sites lose customers - 40% leave if a page takes more than 3 seconds</p>
            </div>
          </div>
          <div className="flex items-start">
            <TrendingUp className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Conversion Rate</h3>
              <p className="text-gray-600 text-sm">Technical problems can prevent customers from contacting or booking with you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Areas */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Comprehensive Website Audit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Page speed and loading time analysis',
            'Mobile responsiveness and usability testing',
            'SEO technical issues and opportunities',
            'Broken links and error page identification',
            'Security vulnerabilities and SSL status',
            'Content quality and optimization review',
            'User experience and navigation assessment',
            'Conversion funnel analysis and optimization',
            'Accessibility compliance checking',
            'Search engine indexing status',
            'Core Web Vitals performance metrics',
            'Competitor comparison and gap analysis'
          ].map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Process */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Our Audit Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-red-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Scan</h3>
            <p className="text-gray-600 text-sm">Automated tools analyze every page and element of your website</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-red-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Manual Review</h3>
            <p className="text-gray-600 text-sm">Expert analysis of user experience and business goals alignment</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-red-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Priority Report</h3>
            <p className="text-gray-600 text-sm">Issues ranked by impact and urgency with clear action items</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-red-600">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Implementation</h3>
            <p className="text-gray-600 text-sm">We fix the issues and optimize your site for better performance</p>
          </div>
        </div>
      </div>

      {/* Technical Optimizations */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Technical Optimizations We Perform</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Improvements</h3>
            <ul className="space-y-2">
              {[
                'Image compression and optimization',
                'Code minification and cleanup',
                'Caching implementation and configuration',
                'Database optimization and cleanup',
                'CDN setup for faster global loading'
              ].map((item, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">SEO Technical Fixes</h3>
            <ul className="space-y-2">
              {[
                'Meta tags optimization and completion',
                'Schema markup implementation',
                'XML sitemap creation and submission',
                'Robots.txt optimization',
                'Internal linking structure improvement'
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

      {/* Security & Maintenance */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Security & Maintenance</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Hardening</h3>
            <p className="text-gray-600">Regular security scans, malware detection, firewall configuration, and vulnerability patching to keep your site safe from threats.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Software Updates</h3>
            <p className="text-gray-600">Keep your website platform, plugins, and themes updated with the latest security patches and feature improvements.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Backup Management</h3>
            <p className="text-gray-600">Automated daily backups with easy restoration options ensure your website can be quickly recovered if anything goes wrong.</p>
          </div>
        </div>
      </div>

      {/* Reporting */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Detailed Audit Reports</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Executive Summary</h3>
            <p className="text-gray-600">High-level overview of your website's health with key metrics and priority recommendations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Technical Details</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Page speed scores and recommendations</li>
                <li>• SEO issues with specific fixes</li>
                <li>• Security vulnerabilities and solutions</li>
                <li>• Mobile usability problems</li>
                <li>• Accessibility compliance status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Business Impact</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Conversion rate optimization opportunities</li>
                <li>• User experience improvements</li>
                <li>• Search ranking potential gains</li>
                <li>• Competitive analysis insights</li>
                <li>• ROI projections for fixes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Monitoring */}
      <div className="mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Continuous Monitoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Monthly Audits</h3>
            <p className="text-gray-600 text-sm">Regular comprehensive scans to catch issues before they impact your business</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Real-time Alerts</h3>
            <p className="text-gray-600 text-sm">Immediate notifications if your site goes down or critical issues are detected</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">Performance Tracking</h3>
            <p className="text-gray-600 text-sm">Monitor improvements over time and track the impact of optimizations</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-display text-gray-900 mb-6">Optimization Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
            <p className="text-gray-600 font-medium">Faster Loading Speed</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
            <p className="text-gray-600 font-medium">Higher Search Rankings</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">30%</div>
            <p className="text-gray-600 font-medium">Better Conversion Rate</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
            <p className="text-gray-600 font-medium">Uptime Reliability</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-display mb-4">
          Optimize Your Website Performance
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Don't let technical issues hurt your business. Get regular audits and optimizations 
          that keep your website fast, secure, and converting visitors into customers.
        </p>
        <button className="bg-white text-red-600 px-8 py-3 rounded-[15px] font-semibold shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-red-700 uppercase tracking-wide text-sm inline-flex items-center">
          Audit My Website
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SiteAuditsOptimization;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email subscription
    console.log('Email submitted:', email);
    setEmail('');
  };

  const websiteLinks = [
    { name: "Free Web Design", link: "/features/websites/free-web-design" },
    { name: "Custom Domains", link: "/features/websites/custom-domains" },
    { name: "GDPR Compliance", link: "/features/websites/gdpr-compliance" },
    { name: "HTTPS Certification", link: "/features/websites/https-certification" },
    { name: "Top Tier Web Hosting", link: "/features/websites/top-tier-web-hosting" },
    { name: "Blogging", link: "/features/websites/blogging" }
  ];

  const aiAutomationLinks = [
    { name: "AI Phone Receptionist", link: "/features/ai-automation/ai-phone-receptionist" },
    { name: "SMS & Email Followups", link: "/features/ai-automation/sms-email-followups" },
    { name: "Multi-Channel Drip Systems", link: "/features/ai-automation/multi-channel-drip-systems" },
    { name: "Conversational AI Chat", link: "/features/ai-automation/conversational-ai-chat" },
    { name: "Automated Workflows", link: "/features/ai-automation/automated-workflows" },
    { name: "Missed Call Text Backs", link: "/features/ai-automation/missed-call-text-backs" }
  ];

  const customerManagementLinks = [
    { name: "Digital Address Book (CRM)", link: "/features/customer-management/digital-address-book" },
    { name: "Online Booking Calendar", link: "/features/customer-management/online-booking-calendar" },
    { name: "Smart Contact Forms", link: "/features/customer-management/smart-contact-forms" },
    { name: "Sales Pipeline", link: "/features/customer-management/sales-pipeline" },
    { name: "Surveys & Feedback", link: "/features/customer-management/surveys-feedback" },
    { name: "Branded Mobile App", link: "/features/customer-management/branded-mobile-app" }
  ];

  const marketingSeoLinks = [
    { name: "Email Newsletters", link: "/features/marketing-seo/email-newsletters" },
    { name: "Post to All Channels", link: "/features/marketing-seo/post-to-all-channels" },
    { name: "Automated Review Requests", link: "/features/ai-automation/automated-review-requests" },
    { name: "Site Audits & Optimization", link: "/features/marketing-seo/site-audits-optimization" },
    { name: "Keyword Rank Tracking", link: "/features/marketing-seo/keyword-rank-tracking" },
    { name: "SEO Reporting", link: "/features/marketing-seo/seo-reporting" },
    { name: "SEO Dashboard", link: "/features/marketing-seo/seo-dashboard" }
  ];

  const companyLinks = [
    { name: "About Us", link: "#" },
    { name: "Blog", link: "/blog" },
    { name: "Newsletter", link: "#" },
    { name: "Contact Us", link: "#" },
    { name: "Cookies", link: "/cookies-policy" },
    { name: "Terms of Service", link: "/terms-of-service" },
    { name: "Privacy Policy", link: "/privacy-policy" }
  ];

  const socialIcons = [
    { name: 'BlueSky', src: '/BlueSky.svg', href: '#' },
    { name: 'Discord', src: '/Discord.svg', href: '#' },
    { name: 'Facebook', src: '/Facebook.svg', href: '#' },
    { name: 'Instagram', src: '/Instagram.svg', href: '#' },
    { name: 'LinkedIn', src: '/LinkedIn.svg', href: '#' },
    { name: 'RSS', src: '/RSS.svg', href: '#' },
    { name: 'TikTok', src: '/TikTok.svg', href: '#' },
    { name: 'Youtube', src: '/Youtube.svg', href: '#' }
  ];

  return (
    <footer>
      {/* Top Section - White Background */}
      <div className="bg-white pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo Section */}
          <div className="flex justify-center mb-12">
            <img 
              src="/Logo_ Wondrous Digital.png" 
              alt="Wondrous Digital" 
              className="h-32 sm:h-40 lg:h-60 w-auto max-w-[90%] sm:max-w-[400px] lg:max-w-[1000px] object-contain px-4 sm:px-0"
            />
          </div>

          {/* Mission Statement */}
          <div className="text-center mb-12 px-4 sm:px-0">
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
              We want to empower you to focus on what you love - running your business.
              Let us handle the technical stuff.
            </p>
            <Link to="/booking" className="bg-gradient-to-r from-[#F867AC] to-[#3C33C0] text-white px-6 sm:px-8 py-3 rounded-[15px] font-semibold shadow-button-primary hover:shadow-button-primary-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-primary-dark-purple uppercase tracking-wide text-xs sm:text-sm mb-8 inline-block">
              Book a Call
            </Link>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 px-4 sm:px-0">
            {/* Websites */}
            <div>
              <h4 className="font-semibold text-primary-pink text-base sm:text-lg mb-3 sm:mb-4">Websites</h4>
              <ul className="space-y-2">
                {websiteLinks.map((item, index) => (
                  <li key={index}>
                    <Link to={item.link} className="text-gray-600 hover:text-primary-pink transition-colors duration-200 text-xs sm:text-sm">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI & Automation */}
            <div>
              <h4 className="font-semibold text-primary-pink text-base sm:text-lg mb-3 sm:mb-4">AI & Automation</h4>
              <ul className="space-y-2">
                {aiAutomationLinks.map((item, index) => (
                  <li key={index}>
                    <Link to={item.link} className="text-gray-600 hover:text-primary-pink transition-colors duration-200 text-xs sm:text-sm">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Management */}
            <div>
              <h4 className="font-semibold text-primary-pink text-base sm:text-lg mb-3 sm:mb-4">Customer Management</h4>
              <ul className="space-y-2">
                {customerManagementLinks.map((item, index) => (
                  <li key={index}>
                    <Link to={item.link} className="text-gray-600 hover:text-primary-pink transition-colors duration-200 text-xs sm:text-sm">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Marketing & SEO */}
            <div>
              <h4 className="font-semibold text-primary-pink text-base sm:text-lg mb-3 sm:mb-4">Marketing & SEO</h4>
              <ul className="space-y-2">
                {marketingSeoLinks.map((item, index) => (
                  <li key={index}>
                    <Link to={item.link} className="text-gray-600 hover:text-primary-pink transition-colors duration-200 text-xs sm:text-sm">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-primary-pink text-base sm:text-lg mb-3 sm:mb-4">Company</h4>
              <ul className="space-y-2">
                {companyLinks.map((item, index) => (
                  <li key={index}>
                    {item.link.startsWith('/') ? (
                      <Link to={item.link} className="text-gray-600 hover:text-primary-pink transition-colors duration-200 text-xs sm:text-sm">
                        {item.name}
                      </Link>
                    ) : (
                      <a href={item.link} className="text-gray-600 hover:text-primary-pink transition-colors duration-200 text-xs sm:text-sm">
                        {item.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Divider */}
      <div 
        className="relative bg-white z-20"
        style={{
          borderRadius: '0 0 75px 75px',
          marginBottom: '-75px'
        }}
      >
        <div className="h-[75px]"></div>
      </div>

      {/* Bottom Section - Purple Background with Newsletter */}
      <div 
        className="relative py-20 pb-24"
        style={{ 
          backgroundColor: '#302940',
          paddingTop: '155px'
        }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 flex justify-center items-center"
          style={{
            backgroundImage: 'url(/BrushStoke-Footer-SignUp.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.6
          }}
        />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display text-white mb-6 leading-tight">
            Get key insights in your inbox every month
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            We'll only send you useful tips that can help you level up your business.
            No marketing, no selling ever. Only value.
          </p>
          
          {/* Email Subscription Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-12">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-[15px] text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-pink text-sm sm:text-base"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#F867AC] to-[#3C33C0] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-[15px] font-semibold shadow-button-primary hover:shadow-button-primary-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-primary-dark-purple uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>

          {/* Social Media Icons */}
          <div className="flex justify-center space-x-6 mb-8">
            {socialIcons.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="text-white/70 hover:text-white transition-colors duration-200"
                aria-label={social.name}
              >
                <img 
                  src={social.src} 
                  alt={social.name} 
                  className="h-6 w-6 filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-200"
                />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-white/60 text-sm">
            © Wondrous, Inc. - All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Globe, Bot, Users, TrendingUp, Settings, ChevronDown, ChevronUp, LayoutGrid, MoreVertical, X } from 'lucide-react';

const FeaturesLayout = () => {
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['websites', 'ai-automation', 'customer-management', 'marketing-seo', 'our-platforms']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleCategory = (categorySlug: string) => {
    setExpandedCategories(prev => 
      prev.includes(categorySlug) 
        ? prev.filter(cat => cat !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const categories = [
    {
      name: 'Websites',
      slug: 'websites',
      icon: Globe,
      items: [
        { name: 'Free Web Design', slug: 'free-web-design' },
        { name: 'Custom Domains', slug: 'custom-domains' },
        { name: 'GDPR Compliance', slug: 'gdpr-compliance' },
        { name: 'HTTPS Certification', slug: 'https-certification' },
        { name: 'Top Tier Web Hosting', slug: 'top-tier-web-hosting' },
        { name: 'Blogging', slug: 'blogging' }
      ]
    },
    {
      name: 'AI & Automation',
      slug: 'ai-automation',
      icon: Bot,
      items: [
        { name: 'AI Phone Receptionist', slug: 'ai-phone-receptionist' },
        { name: 'SMS & Email Follow-ups', slug: 'sms-email-followups' },
        { name: 'Multi-Channel Drip Systems', slug: 'multi-channel-drip-systems' },
        { name: 'Conversational AI Chat', slug: 'conversational-ai-chat' },
        { name: 'Automated Workflows', slug: 'automated-workflows' },
        { name: 'Missed Call Text Backs', slug: 'missed-call-text-backs' },
        { name: 'Automated Review Requests', slug: 'automated-review-requests' }
      ]
    },
    {
      name: 'Customer Management',
      slug: 'customer-management',
      icon: Users,
      items: [
        { name: 'Digital Address Book (CRM)', slug: 'digital-address-book' },
        { name: 'Online Booking Calendar', slug: 'online-booking-calendar' },
        { name: 'Smart Contact Forms', slug: 'smart-contact-forms' },
        { name: 'Sales Pipeline', slug: 'sales-pipeline' },
        { name: 'Surveys & Feedback', slug: 'surveys-feedback' },
        { name: 'Branded Mobile App', slug: 'branded-mobile-app' }
      ]
    },
    {
      name: 'Marketing & SEO',
      slug: 'marketing-seo',
      icon: TrendingUp,
      items: [
        { name: 'Local Search Visibility', slug: 'local-search-visibility' },
        { name: 'Email Newsletters', slug: 'email-newsletters' },
        { name: 'Post to All Channels', slug: 'post-to-all-channels' },
        { name: 'Site Audits & Optimization', slug: 'site-audits-optimization' },
        { name: 'Keyword Rank Tracking', slug: 'keyword-rank-tracking' },
        { name: 'SEO Reporting', slug: 'seo-reporting' },
        { name: 'SEO Dashboard', slug: 'seo-dashboard' }
      ]
    },
    {
      name: 'Our Platforms',
      slug: 'our-platforms',
      icon: Settings,
      items: [
        { name: 'SEO Addon', slug: 'seo-addon' },
        { name: 'SEO Dashboard', slug: 'seo-dashboard' },
        { name: 'Marketing Dashboard', slug: 'marketing-dashboard' },
        { name: 'Our Mobile App', slug: 'our-mobile-app' }
      ]
    }
  ];

  const isActiveRoute = (path: string) => location.pathname === path;
  const isActiveCategoryRoute = (categorySlug: string) => 
    location.pathname === `/features/${categorySlug}` || 
    location.pathname.startsWith(`/features/${categorySlug}/`);

  const SidebarContent = () => (
    <div className="p-6 relative">
      {/* Close button for mobile - only show when mobile menu is open */}
      <button
        onClick={closeMobileMenu}
        className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 z-10"
        aria-label="Close navigation menu"
      >
        <X className="h-6 w-6 text-gray-700" />
      </button>
      
      {/* Features Overview Link */}
      <Link
        to="/features"
        onClick={closeMobileMenu}
        className={`block p-3 mb-4 transition-colors duration-200 ${
          isActiveRoute('/features') 
            ? 'text-primary-pink' 
            : 'text-gray-700 hover:text-primary-pink'
        }`}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <LayoutGrid className="h-5 w-5 text-primary-pink" />
          </div>
          <span className="ml-3 font-black" style={{ color: '#1F0943' }}>Features Overview</span>
        </div>
      </Link>

      {/* Categories */}
      <nav className="space-y-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategories.includes(category.slug);
          const isActiveCategory = isActiveCategoryRoute(category.slug);

          return (
            <div key={category.slug}>
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <Link
                  to={`/features/${category.slug}`}
                  onClick={closeMobileMenu}
                  className={`flex-1 flex items-center p-3 transition-colors duration-200 ${
                    isActiveRoute(`/features/${category.slug}`)
                      ? 'text-primary-pink'
                      : isActiveCategory
                      ? 'text-primary-pink'
                      : 'text-gray-700 hover:text-primary-pink'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-primary-pink" />
                  <span className="ml-3 font-black" style={{ color: '#1F0943' }}>{category.name}</span>
                </Link>
                
                <button
                  onClick={() => toggleCategory(category.slug)}
                  className="p-1 ml-2 hover:bg-gray-100 rounded transition-colors duration-200"
                >
                  {isExpanded ? 
                    <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  }
                </button>
              </div>

              {/* Category Items */}
              {isExpanded && (
                <div className="ml-8 mt-2 space-y-1">
                  {category.items.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/features/${category.slug}/${item.slug}`}
                      onClick={closeMobileMenu}
                      className={`block p-2 transition-colors duration-200 ${
                        isActiveRoute(`/features/${category.slug}/${item.slug}`)
                          ? 'text-primary-pink'
                          : 'text-gray-600 hover:text-primary-pink'
                      }`}
                      style={{ fontSize: '0.8rem', lineHeight: '0.75rem' }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Mobile Header with Menu Button - Only visible on mobile */}
      <div className="block lg:hidden border-b border-gray-200 bg-white sticky top-24 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-black" style={{ color: '#1F0943' }}>Features</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Open navigation menu"
          >
            <MoreVertical className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay - Only visible on mobile when menu is open */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-24">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeMobileMenu}
          />
          {/* Sidebar */}
          <div className="relative w-full max-w-sm bg-white h-full overflow-y-auto shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="w-full">
        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden lg:flex lg:justify-center lg:px-4">
          <div className="w-full max-w-[1280px] grid grid-cols-[275px_1fr] pt-40 pb-40">
            {/* Desktop Sidebar */}
            <div className="border-r border-gray-200 min-h-[calc(100vh-6rem)] overflow-y-auto">
              <SidebarContent />
            </div>
            
            {/* Desktop Main Content Area */}
            <div className="flex-1 min-w-0">
              <div className="px-4 md:px-12 lg:px-20">
                <Outlet />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Full width content, hidden on desktop */}
        <div className="block lg:hidden">
          <div className="px-4 py-6 max-w-full overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesLayout;
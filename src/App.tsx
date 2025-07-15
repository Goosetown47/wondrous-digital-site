import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import { SiteStylesProvider } from './contexts/SiteStylesContext';
import EditBlogPostPage from './pages/dashboard/content/EditBlogPostPage';
import FeaturesLayout from './components/features/FeaturesLayout';
import NewBlogPostPage from './pages/dashboard/content/NewBlogPostPage';
import FeaturesOverviewPage from './pages/features/FeaturesOverviewPage';
import SiteStyles from './pages/dashboard/content/SiteStyles';
import AdminToolsLayout from './components/layout/AdminToolsLayout';
import SectionLibraryPage from './pages/admin/SectionLibraryPage';
import SectionPreviewPage from './pages/admin/SectionPreviewPage';
import StagingPage from './pages/admin/StagingPage';
import WebsitesOverview from './pages/features/categories/WebsitesOverview';
import AIAutomationOverview from './pages/features/categories/AIAutomationOverview';
import CustomerManagementOverview from './pages/features/categories/CustomerManagementOverview';
import MarketingSEOOverview from './pages/features/categories/MarketingSEOOverview';
import OurPlatformsOverview from './pages/features/categories/OurPlatformsOverview';
// Website feature pages
import FreeWebDesign from './pages/features/websites/FreeWebDesign';
import CustomDomains from './pages/features/websites/CustomDomains';
import GDPRCompliance from './pages/features/websites/GDPRCompliance';
import HTTPSCertification from './pages/features/websites/HTTPSCertification';
import TopTierWebHosting from './pages/features/websites/TopTierWebHosting';
import Blogging from './pages/features/websites/Blogging';
// AI & Automation feature pages
import AIPhoneReceptionist from './pages/features/ai-automation/AIPhoneReceptionist';
import SMSEmailFollowups from './pages/features/ai-automation/SMSEmailFollowups';
import MultiChannelDripSystems from './pages/features/ai-automation/MultiChannelDripSystems';
import ConversationalAIChat from './pages/features/ai-automation/ConversationalAIChat';
import AutomatedWorkflows from './pages/features/ai-automation/AutomatedWorkflows';
import MissedCallTextBacks from './pages/features/ai-automation/MissedCallTextBacks';
import AutomatedReviewRequests from './pages/features/ai-automation/AutomatedReviewRequests';
// Customer Management feature pages
import DigitalAddressBook from './pages/features/customer-management/DigitalAddressBook';
import OnlineBookingCalendar from './pages/features/customer-management/OnlineBookingCalendar';
import SmartContactForms from './pages/features/customer-management/SmartContactForms';
import SalesPipeline from './pages/features/customer-management/SalesPipeline';
import SurveysFeedback from './pages/features/customer-management/SurveysFeedback';
import BrandedMobileApp from './pages/features/customer-management/BrandedMobileApp';
// Marketing & SEO feature pages
import LocalSearchVisibility from './pages/features/marketing-seo/LocalSearchVisibility';
import EmailNewsletters from './pages/features/marketing-seo/EmailNewsletters';
import PostToAllChannels from './pages/features/marketing-seo/PostToAllChannels';
import SiteAuditsOptimization from './pages/features/marketing-seo/SiteAuditsOptimization';
import KeywordRankTracking from './pages/features/marketing-seo/KeywordRankTracking';
import SEOReporting from './pages/features/marketing-seo/SEOReporting';
import SEODashboard from './pages/features/marketing-seo/SEODashboard';
// Our Platforms feature pages
import SEOAddon from './pages/features/our-platforms/SEOAddon';
import MarketingDashboard from './pages/features/our-platforms/MarketingDashboard';
import OurMobileApp from './pages/features/our-platforms/OurMobileApp';
import DashboardPage from './pages/DashboardPage';
import MarketingLayout from './components/layout/MarketingLayout';
import BookingPage from './pages/BookingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import CookiesPolicyPage from './pages/CookiesPolicyPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import LoginPage from './pages/LoginPage';
import BlogPostsPage from './pages/dashboard/content/BlogPostsPage';
import PageBuilderPage from './pages/dashboard/content/PageBuilderPage';
import PagesPage from './pages/dashboard/content/PagesPage';
import PagePreview from './pages/PagePreview';
import MarketingPage from './pages/dashboard/tools/MarketingPage';
import SEOPage from './pages/dashboard/tools/SEOPage';
import AccountPage from './pages/dashboard/settings/AccountPage';
import BillingPage from './pages/dashboard/settings/BillingPage';

function App() {
  return (
    <Routes>
      {/* App Routes - No marketing navigation/footer */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Page Preview Route - Standalone page viewing */}
      <Route path="/preview/:pageId" element={<PagePreview />} />

      {/* Dashboard Routes - Nested under AppLayout */}
      <Route path="/dashboard" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="content/blog" element={<BlogPostsPage />} />
        <Route path="content/blog/new" element={<NewBlogPostPage />} />
        <Route path="content/blog/edit/:postId" element={<EditBlogPostPage />} />
        <Route path="content/pages" element={<PagesPage />} />
        <Route path="content/pages/builder/:pageId" element={<PageBuilderPage />} />
        <Route path="content/site-styles" element={<SiteStyles />} />
        <Route path="tools/marketing" element={<MarketingPage />} />
        <Route path="tools/seo" element={<SEOPage />} />
        <Route path="settings/account" element={<AccountPage />} />
        <Route path="settings/account/billing" element={<BillingPage />} />
        
        {/* Admin Routes - Only visible to admin users */}
        <Route path="admin" element={<AdminToolsLayout />}>
          <Route path="section-library" element={<SectionLibraryPage />} />
          <Route path="staging" element={
            <SiteStylesProvider>
              <StagingPage />
            </SiteStylesProvider>
          } />
          <Route path="section-preview/:id" element={
            <SiteStylesProvider>
              <SectionPreviewPage />
            </SiteStylesProvider>
          } />
        </Route>
      </Route>
      
      {/* Marketing Website Routes - With navigation and footer */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesLayout />}>
          <Route index element={<FeaturesOverviewPage />} />
          
          {/* Category Overview Pages */}
          <Route path="websites" element={<WebsitesOverview />} />
          <Route path="ai-automation" element={<AIAutomationOverview />} />
          <Route path="customer-management" element={<CustomerManagementOverview />} />
          <Route path="marketing-seo" element={<MarketingSEOOverview />} />
          <Route path="our-platforms" element={<OurPlatformsOverview />} />
          
          {/* Website Feature Pages */}
          <Route path="websites/free-web-design" element={<FreeWebDesign />} />
          <Route path="websites/custom-domains" element={<CustomDomains />} />
          <Route path="websites/gdpr-compliance" element={<GDPRCompliance />} />
          <Route path="websites/https-certification" element={<HTTPSCertification />} />
          <Route path="websites/top-tier-web-hosting" element={<TopTierWebHosting />} />
          <Route path="websites/blogging" element={<Blogging />} />
          
          {/* AI & Automation Feature Pages */}
          <Route path="ai-automation/ai-phone-receptionist" element={<AIPhoneReceptionist />} />
          <Route path="ai-automation/sms-email-followups" element={<SMSEmailFollowups />} />
          <Route path="ai-automation/multi-channel-drip-systems" element={<MultiChannelDripSystems />} />
          <Route path="ai-automation/conversational-ai-chat" element={<ConversationalAIChat />} />
          <Route path="ai-automation/automated-workflows" element={<AutomatedWorkflows />} />
          <Route path="ai-automation/missed-call-text-backs" element={<MissedCallTextBacks />} />
          <Route path="ai-automation/automated-review-requests" element={<AutomatedReviewRequests />} />
          
          {/* Customer Management Feature Pages */}
          <Route path="customer-management/digital-address-book" element={<DigitalAddressBook />} />
          <Route path="customer-management/online-booking-calendar" element={<OnlineBookingCalendar />} />
          <Route path="customer-management/smart-contact-forms" element={<SmartContactForms />} />
          <Route path="customer-management/sales-pipeline" element={<SalesPipeline />} />
          <Route path="customer-management/surveys-feedback" element={<SurveysFeedback />} />
          <Route path="customer-management/branded-mobile-app" element={<BrandedMobileApp />} />
          
          {/* Marketing & SEO Feature Pages */}
          <Route path="marketing-seo/local-search-visibility" element={<LocalSearchVisibility />} />
          <Route path="marketing-seo/email-newsletters" element={<EmailNewsletters />} />
          <Route path="marketing-seo/post-to-all-channels" element={<PostToAllChannels />} />
          <Route path="marketing-seo/site-audits-optimization" element={<SiteAuditsOptimization />} />
          <Route path="marketing-seo/keyword-rank-tracking" element={<KeywordRankTracking />} />
          <Route path="marketing-seo/seo-reporting" element={<SEOReporting />} />
          <Route path="marketing-seo/seo-dashboard" element={<SEODashboard />} />
          
          {/* Our Platforms Feature Pages */}
          <Route path="our-platforms/seo-addon" element={<SEOAddon />} />
          <Route path="our-platforms/marketing-dashboard" element={<MarketingDashboard />} />
          <Route path="our-platforms/our-mobile-app" element={<OurMobileApp />} />
        </Route>
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Route>
      
      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
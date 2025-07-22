import { SiteStylesProvider } from '@/components/SiteStylesProvider';
import ClientWrapper from '@/app/sites/[projectId]/preview/ClientWrapper';
import FourFeaturesGrid from '@/components/sections/FourFeaturesGrid';
import { mockDentistSiteStyles, mockFourFeaturesContent } from '@/lib/mockContent';

export default function TestStyledPage() {
  return (
    <>
      <SiteStylesProvider styles={mockDentistSiteStyles}>
        <ClientWrapper siteStyles={mockDentistSiteStyles}>
          <div className="min-h-screen">
            <h1 className="text-3xl font-bold p-8">Test Page with Hardcoded Styles</h1>
            <FourFeaturesGrid content={mockFourFeaturesContent} />
          </div>
        </ClientWrapper>
      </SiteStylesProvider>
    </>
  );
}
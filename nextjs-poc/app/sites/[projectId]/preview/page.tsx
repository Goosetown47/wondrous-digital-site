import { supabaseAdmin } from '@/lib/supabase';
import { SiteStylesProvider } from '@/components/SiteStylesProvider';
import FourFeaturesGrid from '@/components/sections/FourFeaturesGrid';
import ClientWrapper from './ClientWrapper';
import { mockFourFeaturesContent, mockDentistSiteStyles } from '@/lib/mockContent';

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function PreviewPage({ params }: PageProps) {
  const { projectId } = await params;
  console.log('Fetching styles for project:', projectId);
  
  // Fetch site styles for this project
  const { data: siteStyles, error } = await supabaseAdmin
    .from('site_styles')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error) {
    console.error('Error fetching site styles:', {
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
  } else {
    console.log('Successfully fetched site styles:', {
      primary_color: siteStyles?.primary_color,
      secondary_color: siteStyles?.secondary_color
    });
  }

  // For now, we'll use test content. In production, this would come from the database
  const testContent = {
    sections: [
      {
        type: '4-features-grid',
        content: mockFourFeaturesContent // Use mock content with proper icons and colors
      }
    ]
  };

  // Use mock styles if database fetch failed
  const finalStyles = siteStyles || mockDentistSiteStyles;

  return (
    <>
      <SiteStylesProvider styles={finalStyles}>
        <ClientWrapper siteStyles={finalStyles}>
          <div className="min-h-screen">
            {testContent.sections.map((section, index) => {
              if (section.type === '4-features-grid') {
                return <FourFeaturesGrid key={index} content={section.content} />;
              }
              return null;
            })}
          </div>
        </ClientWrapper>
      </SiteStylesProvider>
    </>
  );
}

// For static export, we need to know which projects to build
export async function generateStaticParams() {
  // In production, this would fetch all projects that need static sites
  // For testing, we'll use your actual project ID
  return [
    { projectId: 'f77e582f-69ed-4565-a07d-521693d25095' }
  ];
}
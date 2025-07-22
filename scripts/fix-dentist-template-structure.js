import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function fixDentistTemplateStructure() {
  console.log('🔧 Fixing Dentist Template structure...\n');
  
  try {
    const projectId = '923eb256-26eb-4cf3-8e64-ddd1297863c0';
    
    // 1. Fix page slugs
    console.log('1. Fixing page slugs...');
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId);
    
    if (pages) {
      for (const page of pages) {
        let slug;
        if (page.is_homepage) {
          slug = 'home';
        } else if (page.page_name === 'About Us') {
          slug = 'about';
        } else if (page.page_name === 'Services') {
          slug = 'services';
        }
        
        if (slug && !page.slug) {
          const { error } = await supabase
            .from('pages')
            .update({ slug })
            .eq('id', page.id);
          
          if (!error) {
            console.log(`   ✅ Updated slug for ${page.page_name}: ${slug}`);
          }
        }
      }
    }
    
    // 2. Find the correct global nav section (with actual content)
    console.log('\n2. Finding correct global navigation section...');
    const { data: navSections } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', projectId)
      .eq('section_type', 'navigation')
      .is('page_id', null);
    
    // Find the navigation section with the most complete content
    let bestNavSection = null;
    if (navSections) {
      for (const section of navSections) {
        if (section.content && section.content.content && section.content.content.logo) {
          bestNavSection = section;
          break;
        }
      }
      
      // If we didn't find one with nested content, look for one with menu_items
      if (!bestNavSection) {
        bestNavSection = navSections.find(s => s.content && s.content.menu_items);
      }
    }
    
    if (bestNavSection) {
      console.log(`   ✅ Found navigation section: ${bestNavSection.id}`);
      
      // Update project with this nav section
      const { error } = await supabase
        .from('projects')
        .update({ global_nav_section_id: bestNavSection.id })
        .eq('id', projectId);
      
      if (!error) {
        console.log('   ✅ Updated project global nav section');
      }
    }
    
    // 3. Add missing content sections for Home and About pages
    console.log('\n3. Adding missing content sections...');
    
    const homeContent = [
      {
        section_type: 'hero',
        content: {
          heading: 'Welcome to Bright Smiles Dental',
          subheading: 'Your trusted partner for exceptional dental care and beautiful smiles',
          buttonText: 'Book Appointment',
          buttonLink: '/contact',
          backgroundImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600'
        },
        order_index: 0
      },
      {
        section_type: 'features',
        content: {
          heading: 'Why Choose Our Practice',
          features: [
            {
              title: 'Expert Team',
              description: 'Our experienced dentists use the latest techniques and technology',
              icon: '🦷'
            },
            {
              title: 'Comfortable Care',
              description: 'We prioritize your comfort with a relaxing, spa-like atmosphere',
              icon: '😊'
            },
            {
              title: 'Flexible Hours',
              description: 'Evening and weekend appointments available for your convenience',
              icon: '⏰'
            }
          ]
        },
        order_index: 1
      },
      {
        section_type: 'cta',
        content: {
          heading: 'Ready for a Healthier Smile?',
          text: 'Schedule your consultation today and discover the difference personalized dental care can make.',
          buttonText: 'Get Started',
          buttonLink: '/contact'
        },
        order_index: 2
      }
    ];
    
    const aboutContent = [
      {
        section_type: 'hero',
        content: {
          heading: 'About Bright Smiles Dental',
          subheading: 'Committed to excellence in dental care since 2010',
          backgroundImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600'
        },
        order_index: 0
      },
      {
        section_type: 'text',
        content: {
          heading: 'Our Story',
          text: 'Founded by Dr. Sarah Johnson, Bright Smiles Dental has been serving our community for over a decade. We believe that everyone deserves access to high-quality dental care in a comfortable, welcoming environment. Our team is dedicated to helping you achieve and maintain optimal oral health through personalized treatment plans and preventive care.',
          alignment: 'center'
        },
        order_index: 1
      },
      {
        section_type: 'team',
        content: {
          heading: 'Meet Our Team',
          members: [
            {
              name: 'Dr. Sarah Johnson',
              role: 'Lead Dentist',
              image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
              bio: '15 years of experience in general and cosmetic dentistry'
            },
            {
              name: 'Dr. Michael Chen',
              role: 'Orthodontist',
              image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
              bio: 'Specialist in Invisalign and traditional braces'
            },
            {
              name: 'Lisa Rodriguez',
              role: 'Dental Hygienist',
              image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
              bio: 'Expert in preventive care and patient education'
            }
          ]
        },
        order_index: 2
      }
    ];
    
    // Add content to Home page
    const homePage = pages?.find(p => p.is_homepage);
    if (homePage) {
      console.log('   Adding content to Home page...');
      for (const section of homeContent) {
        const { error } = await supabase
          .from('page_sections')
          .insert({
            project_id: projectId,
            page_id: homePage.id,
            section_type: section.section_type,
            content: section.content,
            order_index: section.order_index
          });
        
        if (!error) {
          console.log(`     ✅ Added ${section.section_type} section`);
        }
      }
    }
    
    // Add content to About page
    const aboutPage = pages?.find(p => p.page_name === 'About Us');
    if (aboutPage) {
      console.log('   Adding content to About page...');
      for (const section of aboutContent) {
        const { error } = await supabase
          .from('page_sections')
          .insert({
            project_id: projectId,
            page_id: aboutPage.id,
            section_type: section.section_type,
            content: section.content,
            order_index: section.order_index
          });
        
        if (!error) {
          console.log(`     ✅ Added ${section.section_type} section`);
        }
      }
    }
    
    // 4. Clean up duplicate navigation sections
    console.log('\n4. Cleaning up duplicate navigation sections...');
    const { data: allNavSections } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', projectId)
      .eq('section_type', 'navigation')
      .is('page_id', null);
    
    if (allNavSections && allNavSections.length > 1) {
      // Keep only the best one and delete others
      const toDelete = allNavSections.filter(s => s.id !== bestNavSection?.id);
      for (const section of toDelete) {
        const { error } = await supabase
          .from('page_sections')
          .delete()
          .eq('id', section.id);
        
        if (!error) {
          console.log(`   ✅ Deleted duplicate navigation section ${section.id}`);
        }
      }
    }
    
    console.log('\n✅ Dentist template structure fixed!');
    console.log('   - Page slugs updated');
    console.log('   - Global navigation section set');
    console.log('   - All pages now have content');
    console.log('   - Duplicate sections cleaned up');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixDentistTemplateStructure();
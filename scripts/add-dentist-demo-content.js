import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function addDentistDemoContent() {
  console.log('🦷 Adding demo content to Dentist Template...\n');
  
  try {
    // Find the dentist template project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('subdomain', 'dentist-1')
      .single();
    
    if (projectError || !project) {
      console.error('❌ Could not find dentist-1 project:', projectError);
      return;
    }
    
    console.log('✅ Found project:', project.project_name);
    
    // Get pages
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', project.id)
      .order('order_index', { ascending: true });
    
    if (pagesError || !pages) {
      console.error('Error getting pages:', pagesError);
      return;
    }
    
    // First, update page slugs
    console.log('\n📝 Updating page slugs...');
    for (const page of pages) {
      let slug = '';
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
          .update({ slug: slug })
          .eq('id', page.id);
        
        if (error) {
          console.error(`Error updating slug for ${page.page_name}:`, error);
        } else {
          console.log(`   ✅ Updated slug for ${page.page_name}: ${slug}`);
        }
      }
    }
    
    // Define demo content for each page
    const demoContent = {
      home: [
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
      ],
      about: [
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
      ],
      services: [
        {
          section_type: 'hero',
          content: {
            heading: 'Our Services',
            subheading: 'Comprehensive dental care for the whole family',
            backgroundImage: 'https://images.unsplash.com/photo-1609207825181-52d3214556dd?w=1600'
          },
          order_index: 0
        },
        {
          section_type: 'services-grid',
          content: {
            heading: 'What We Offer',
            services: [
              {
                title: 'General Dentistry',
                description: 'Regular checkups, cleanings, fillings, and preventive care',
                icon: '🦷'
              },
              {
                title: 'Cosmetic Dentistry',
                description: 'Teeth whitening, veneers, and smile makeovers',
                icon: '✨'
              },
              {
                title: 'Orthodontics',
                description: 'Traditional braces and Invisalign clear aligners',
                icon: '😁'
              },
              {
                title: 'Oral Surgery',
                description: 'Tooth extractions, wisdom teeth removal, and implants',
                icon: '🔧'
              },
              {
                title: 'Pediatric Dentistry',
                description: 'Gentle, specialized care for children',
                icon: '👶'
              },
              {
                title: 'Emergency Care',
                description: 'Same-day appointments for dental emergencies',
                icon: '🚨'
              }
            ]
          },
          order_index: 1
        },
        {
          section_type: 'cta',
          content: {
            heading: 'Schedule Your Appointment',
            text: 'Don\'t wait for dental problems to develop. Book your preventive care appointment today.',
            buttonText: 'Book Now',
            buttonLink: '/contact'
          },
          order_index: 2
        }
      ]
    };
    
    // Add sections to pages
    console.log('\n🎨 Adding demo sections to pages...');
    
    for (const page of pages) {
      const pageSlug = page.slug || (page.is_homepage ? 'home' : page.page_name.toLowerCase().replace(' ', '-'));
      const sections = demoContent[pageSlug] || demoContent[pageSlug.replace('-', '')];
      
      if (sections) {
        console.log(`\n   Adding ${sections.length} sections to ${page.page_name}...`);
        
        for (const section of sections) {
          const { data, error } = await supabase
            .from('page_sections')
            .insert({
              project_id: project.id,
              page_id: page.id,
              section_type: section.section_type,
              content: section.content,
              order_index: section.order_index
            })
            .select()
            .single();
          
          if (error) {
            console.error(`     ❌ Error adding ${section.section_type} section:`, error);
          } else {
            console.log(`     ✅ Added ${section.section_type} section`);
          }
        }
      }
    }
    
    // Add a footer section at project level
    console.log('\n🦶 Adding footer section...');
    const { data: footerSection, error: footerError } = await supabase
      .from('page_sections')
      .insert({
        project_id: project.id,
        page_id: null, // Project-level section
        section_type: 'footer',
        content: {
          companyName: 'Bright Smiles Dental',
          address: '123 Main Street, Suite 100, Anytown, USA 12345',
          phone: '(555) 123-4567',
          email: 'info@brightsmilesdental.com',
          socialLinks: [
            { platform: 'facebook', url: 'https://facebook.com/brightsmiles' },
            { platform: 'instagram', url: 'https://instagram.com/brightsmiles' },
            { platform: 'twitter', url: 'https://twitter.com/brightsmiles' }
          ],
          copyrightText: '© 2025 Bright Smiles Dental. All rights reserved.'
        },
        order_index: 999
      })
      .select()
      .single();
    
    if (footerError) {
      console.error('   ❌ Error adding footer:', footerError);
    } else {
      console.log('   ✅ Added footer section');
      
      // Update project with footer section ID
      await supabase
        .from('projects')
        .update({ global_footer_section_id: footerSection.id })
        .eq('id', project.id);
    }
    
    console.log('\n✅ Demo content added successfully!');
    console.log('   The dentist template now has meaningful content for deployment.');
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

addDentistDemoContent();
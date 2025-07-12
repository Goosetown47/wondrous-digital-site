import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Bot, LayoutGrid, Home, Smartphone, CheckCircle, Gift, FormInput, CalendarClock, MapPin, ArrowRight } from 'lucide-react';

const FeaturesOverview = () => {
  const problemsAndSolutions = [
    {
      problemLabel: "Common Problem",
      problemText: "\"I miss calls when I'm with customers and lose business...\"",
      solutionsLabel: "Our Solutions",
      solutions: [
        {
          icon: PhoneCall,
          title: "Missed Call Text Backs",
          description: "When someone calls and you can't answer, they instantly get a text saying you'll call them back soon.",
          link: "/features/ai-automation/missed-call-text-backs"
        },
        {
          icon: Bot,
          title: "AI Phone Receptionist",
          description: "A friendly voice answers your phone 24/7, books appointments, and answers common questions.",
          link: "/features/ai-automation/ai-phone-receptionist"
        },
        {
          icon: LayoutGrid,
          title: "All messages in one place",
          description: "See texts, calls, emails, and social messages in one spot.",
          link: "/features/customer-management/digital-address-book"
        }
      ]
    },
    {
      problemLabel: "Common Problem",
      problemText: "\"I feel embarrassed about my outdated website...\"",
      solutionsLabel: null, // Remove label for this section
      solutions: [
        {
          icon: Home,
          title: "Free Professional Website",
          description: "We design and build you a professional website at no charge - seriously, it's free.",
          link: "/features/websites/free-web-design"
        },
        {
          icon: Smartphone,
          title: "Mobile-ready automatically",
          description: "All our websites are mobile ready. Your site will look perfect on phones.",
          link: "/features/websites/free-web-design"
        },
        {
          icon: CheckCircle,
          title: "Fast loading, Always Online",
          description: "A friendly, conversational voice answers your phone 24/7, books appointments and answers common questions.",
          link: "/features/websites/top-tier-web-hosting"
        }
      ]
    },
    {
      problemLabel: "Common Problem",
      problemText: "\"I forget to follow up and customers slip away...\"",
      solutionsLabel: null, // Remove label for this section
      solutions: [
        {
          icon: PhoneCall,
          title: "Automatic thank you's",
          description: "Every customer gets a personalized thank you text after each visit.",
          link: "/features/ai-automation/sms-email-followups"
        },
        {
          icon: Gift,
          title: "Birthday greetings",
          description: "We'll remember and wish your customers special days without you remembering.",
          link: "/features/ai-automation/automated-workflows"
        },
        {
          icon: LayoutGrid,
          title: "Review requests that work",
          description: "Happy customers get asked for reviews at the perfect time.",
          link: "/features/ai-automation/automated-review-requests"
        }
      ]
    },
    {
      problemLabel: "Common Problem",
      problemText: "\"I have no idea how to get new customers online...\"",
      solutionsLabel: null, // Remove label for this section
      solutions: [
        {
          icon: FormInput,
          title: "Smart contact forms",
          description: "Website visitors become leads in your digital address book automatically.",
          link: "/features/customer-management/smart-contact-forms"
        },
        {
          icon: CalendarClock,
          title: "Online booking",
          description: "Customers book appointments themselves at 2am if they want.",
          link: "/features/customer-management/online-booking-calendar"
        },
        {
          icon: MapPin,
          title: "Local search visibility",
          description: "Show up on the first page when people nearby search for your type of business.",
          link: "/features/marketing-seo/local-search-visibility"
        }
      ]
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Image - Constrained and positioned */}
      <div className="absolute inset-0 flex justify-center">
        <div 
          className="w-full max-w-[1280px] h-full"
          style={{
            backgroundImage: 'url(/BrushStroke-Features-BG.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            marginTop: '120px'
          }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
            Smart tools that grow your business.
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Intelligent features work around the clock to bring in<br />
            new customers and keep existing ones happy.
          </p>
        </div>

        {/* Problem-Solution Sections */}
        <div className="space-y-20">
          {problemsAndSolutions.map((item, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                {/* Problem Side - Now centered vertically */}
                <div className={`flex flex-col justify-center ${!isEven ? 'lg:order-2' : 'lg:order-1'} ${isEven ? 'lg:items-end' : ''}`}>
                  {/* Wrapper div for left side sections to align both tag and text together */}
                  <div className={`${isEven ? 'lg:ml-auto' : ''}`}>
                    <div className="inline-block bg-primary-pink text-white px-4 py-2 text-sm font-semibold mb-6 uppercase tracking-wide w-fit">
                      {item.problemLabel}
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-display font-medium text-primary-dark-purple leading-tight max-w-[25rem] text-left">
                      {item.problemText}
                    </h3>
                  </div>
                </div>

                {/* Solutions Side */}
                <div className={`${!isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  {/* Only show solutions label for first section */}
                  {item.solutionsLabel && (
                    <div className="inline-block bg-primary-pink text-white px-4 py-2 text-sm font-semibold mb-6 uppercase tracking-wide w-fit">
                      {item.solutionsLabel}
                    </div>
                  )}
                  
                  <div className="space-y-8">
                    {item.solutions.map((solution, solutionIndex) => {
                      let cardClass = '';
                      
                      if (isEven) {
                        // Left-aligned section: top/bottom flush left, middle flush right
                        cardClass = solutionIndex === 1 ? 'lg:ml-auto lg:max-w-md' : 'lg:max-w-md';
                      } else {
                        // Right-aligned section: top/bottom flush right, middle flush left
                        cardClass = solutionIndex === 1 ? 'lg:mr-auto lg:max-w-md' : 'lg:ml-auto lg:max-w-md';
                      }
                      
                      return (
                        <Link
                          to={solution.link}
                          key={solutionIndex}
                          className={`group block bg-white p-6 rounded-2xl shadow-premium hover:shadow-premium transition-all duration-300 ease-in-out border border-gray-100 hover:border-transparent cursor-pointer relative overflow-hidden ${cardClass}`}
                          style={{
                            background: 'white',
                            backgroundClip: 'padding-box'
                          }}
                        >
                          {/* Gradient border on hover */}
                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" 
                               style={{
                                 background: 'linear-gradient(135deg, #3E33C0 0%, #F666AB 100%)',
                                 padding: '1px'
                               }}>
                            <div className="w-full h-full bg-white rounded-2xl"></div>
                          </div>
                          
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <solution.icon className="h-12 w-12 text-primary-pink flex-shrink-0" />
                              <div className="flex-1 pr-4">
                                <h4 className="font-medium text-gray-900 text-lg mb-2">
                                  {solution.title}
                                </h4>
                                <p className="text-gray-600 text-sm max-w-xs" style={{ lineHeight: '1.25rem' }}>
                                  {solution.description}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-primary-pink flex-shrink-0 transform group-hover:translate-x-2 transition-transform duration-300 ease-in-out" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* See All Features Link */}
        <div className="text-center mt-20">
          <Link to="/features" className="inline-flex items-center text-primary-pink font-semibold text-lg hover:text-primary-dark-purple transition-colors duration-200">
            See all our features
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesOverview;
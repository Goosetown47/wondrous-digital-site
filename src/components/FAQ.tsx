import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How quickly will I see results?",
      answer: `Once the systems and platform are set up and working, you should see results right away in terms of time saved and the number of happy customers. Every system that's working means you and your team don't have to. Most businesses see improvements within 30 days - more website visitors, better lead capture, fewer missed calls.\n\nReal growth typically starts in months 2-3 as the automated systems kick in and your online presence strengthens. You customers are reminded to show up and do. Old customers begin to reengage.\nBirthdays are remembered.\nCalls are always answered.\nPeople feel cared for = more business.`
    },
    {
      question: "How long does it take to set up?",
      answer: `New customers can expect to see a new live website within 48-72 hours of signing up. \nThe smart platform takes about 1 week to integrate into your website. \nOur SEO addon takes about 1 week to set up and integrate into your website.`
    },
    {
      question: "What happens after I sign up and pay?",
      answer: `After you sign up, you'll receive an onboarding form via email to complete at your convenience. Meanwhile, we'll create your personal Notion Kanban board and invite you and your team. This board serves as your communication hub where you can submit requests and send messages that we check daily.\n
Next, we'll either create your website from scratch or customize your existing one—a process that takes approximately 72 hours.\n
Following this, we'll set up your marketing platform and integrate it with your website, which typically takes about a week.\n
Once everything is ready, we'll schedule a training session with whoever will be using your system to ensure they're comfortable with all features.\n
Finally, we'll check in with you monthly to discuss progress and identify opportunities for improvement.`
    },
    {
      question: "Are the website fully custom?",
      answer: `Your website is custom-built for your business using my 20 years of design experience, including work on Amazon.com's homepage. You get your branding, colors, content, and sections chosen specifically for your needs. \n\nWhy I build this way: Working at Amazon taught me that simple, fast websites dramatically outperform complex designs. Research proves visitors judge sites in 50 milliseconds and the highest-converting websites have 40% fewer elements.
\nI apply these enterprise-level principles to create clean, effective websites for local businesses. You're getting the same strategic approach used by billion-dollar companies, adapted for your specific needs - without the massive price tag. \nThe result: A professional website that looks great, loads fast, and actually converts visitors into customers.`
    },
    {
      question: "What if I don't like the website you build for me?",
      answer: `We'll make it right. We build your site with your logo, colors, and content, then include two rounds of revisions to perfect it. Most clients love the result because we use proven designs that convert.\n\nStill not happy? No charge, no hard feelings. \n\nWhat we don't offer: Endless revisions or custom design work. This is a marketing system that includes a professional website, not a custom design project. \n\nThe key: Your website is just the foundation. The automated marketing system that brings customers 24/7 is what transforms your business - not the perfect font choice. \n\nNote: Revisions begin once you're on a monthly plan. This ensures we're partnering with serious business owners, not providing free design work. \n\nBottom line: A beautiful website without customers is just an expensive business card. We're here to grow your business.`
    },
    {
      question: "How do you actually design and build a website for free for me and make any money? Why free?",
      answer: `We make money from the monthly service that brings you customers 24/7, not from building websites. \n\nTo be candid, thanks to AI tools, what used to take weeks now takes hours. While it still takes deep expertise, the process is only getting quicker and better. \n\nThe real value? The automated systems working round the clock for you. That's what you pay for monthly. \n\nWe want to empower you to focus on what you love - running your business. Let us handle the technical stuff. The free website proves we mean business. The monthly systems transform yours.`
    },
    {
      question: "How is this different from DIY website builders like Wix or Squarespace?",
      answer: `Could you build a Wix site yourself? Sure. But you'd spend weeks learning, building, and tweaking - time better spent serving customers. Plus, you'd still need to buy and configure all the marketing tools separately.`
    },
    {
      question: "You say we design a free website for you but charge a setup fee. What’s that about?",
      answer: `These are two different things: \n\nFree: Website design, development, and launch. Other agencies charge $3,000-$15,000 for this alone. You pay zero. \n\nSetup fee: Configuring your complete marketing platform - automated text-backs, AI chat, appointment booking, email sequences, review requests, and dozens of other features. Plus integrating everything with your website and training you to use it. \n\nThe setup takes a fair amount of time - creating your custom workflows, connecting your accounts, configuring automations for your specific business. That's what the one-time fee covers.`
    },
    {
      question: "Do I really own my website?",
      answer: `Yes, you own the website design and content. Unlike template builders that lock you in, we build you a real website with modern code (React, Tailwind, Vite) that any developer can work with. \n\nHere's the deal:\n\n- You own: The website design, layout, and your content \n- We own: The marketing platform, automations, and smart features that make it powerful. \n\nIf you leave: After 3 months as a customer, we'll provide your website files for a $250 migration fee. You can take it to any developer. The website itself will work, but without the integrated marketing features.\n\nWhy 3 months? We make a healthy investment of our time in you when we build a website for free. We expect a minimal commitment back before we hand over designs.\n\nCanceling: You can cancel anytime from day one - we'll simply turn off your account. The 3-month minimum only applies if you want to take the website files with you.`
    },
    {
      question: "How many changes do I get?",
      answer: `We'll work with you to get it right, but within reasonable boundaries. This keeps our service affordable while delivering professional results.\n\nDuring setup, you get 2 rounds of design revisions to adjust the look and feel. We want you happy with the result. Once you're live, every monthly package includes 3 minor updates - things like content changes, new images, or adding pages. This covers what most businesses need month-to-month.\n\nWhat this isn't: A fully custom design service with unlimited revisions. We use our proven building blocks to create your site efficiently.\n\nStill not happy after 2 design rounds? No problem - you can cancel with no obligation. Or if you want extensive design changes beyond the included revisions, we can do that at $250/hour.`
    },
    {
      question: "Can I customize things myself after you set it up?",
      answer: `You can add blog posts anytime - they'll automatically appear on your site. For design changes, just ask us! Each month includes 3 updates like content changes, new photos, or small tweaks.\n\nYou won't have direct access to edit the site design yourself. This is actually a benefit - you get a professionally-built website you truly own (not trapped in a platform like Wix), and we handle all the technical work so you never break anything.\n\nThink of it like having a professional on call. Instead of spending hours trying to figure out how to make changes, you just send us a quick message or post it on your personal kanban board and we'll handle it.`
    },
    {
      question: "I'm not tech-savvy at all. Will I be able to manage this system?",
      answer: `Absolutely! We built this specifically for business owners, not tech experts. If you can use Facebook or send a text, you can use this system.\n
Here's what makes it easy:
- Everything is already set up and running when you get access
- You get a personal 1-hour training session (for you or your staff)
- The dashboard looks like familiar apps you already use
- Most features run automatically - you just check results\n
Day-to-day, you'll spend maybe 10-15 minutes checking messages and leads. No coding, no complex settings. Just simple dashboards showing new customers, appointments, and reviews.`
    },
    {
      question: "Can I still answer my own phone and emails if I want to?",
      answer: `Of course! The system enhances what you do, not replaces it. You can jump into any conversation, override automations, and add personal touches whenever you want. It handles the routine stuff so you can focus on meaningful interactions.`
    },
    {
      question: "How do I know this will work for my specific type of business?",
      answer: `We've built proven systems for your industry that other businesses are already using successfully. During setup, we customize everything for your specific services and local market. You're not getting a generic solution - you're getting what works.`
    },
    {
      question: "What if I need help or something breaks?", 
      answer: 'Email, text, call us, or book an appointment and we will help you get it sorted out.'
    },
    {
      question: "$397+ per month seems expensive. Why not just hire someone part-time?",
      answer: `We are only charging you for hosting, usage of the system, and maintenance/premium support.\n
      A part-time employee costs $1,500-3,000/month and can only work certain hours. Our system works 24/7, never calls in sick, and handles tasks that would take a human 40+ hours per week. Plus, you'd still need to buy all the software tools we include.`
    },
    {
      question: "Are there any refunds?",
      answer: `If you accidentally paid for a month, are overcharged, or cancelled and were still charged we will absolutely refund your money. We don't offer refunds for completed work or services already used.\n\nHere's why:
- Setup fee: Covers the time we spend configuring your system.
- Monthly fees: Covers charges you've already spent this month.
- Website: It's free, so nothing to refund. \n
What you CAN do: Cancel anytime moving forward. No contracts, no cancellation fees, no questions asked. You're never locked in.`
    },
    {
      question: "Can I cancel anytime?",
      answer: `Yes, absolutely. Cancel anytime, for any reason, no questions asked. We believe in earning your business every month, not trapping you with contracts. \n\nWhat happens when you cancel:
- We turn off your website and archive it (in case you want to come back)
- No cancellation fees or penalties\n
Want to take your website with you? If you've been a customer for 3+ months, we'll package up your website files for a $250 fee. You'll get the design, content, and structure built with modern code (React, Tailwind) that any developer can work with.\n
Note: The website files won't include the marketing features, automations, or integrations - just the website itself.`
    },
    {
      question: "What information do you need from me to get started?",
      answer: `- We have a questionnaire that we'll ask you to fill out.
- Once you've filled it out, we'll add you to your very own KanBan board where you can make requests, post issues, ask for things and communicate with us.`
    },
    {
      question: "Will customers know I'm using automation, or will it feel personal?",
      answer: `Everything is customized with your voice and brand. Automated messages look like they come directly from you. Customers appreciate quick responses and consistent communication - they won't know or care that it's automated as long as it's helpful.`
    },
    {
      question: "Do I need to change how I currently run my business?",
      answer: `Not at all. We build the system around your existing processes. Keep using your favorite tools, answer calls when you want, and run your business your way. We just add smart automation in the background to capture more opportunities.`
    }
  ];

  return (
    <div className="relative">
      {/* Curved white overlay that sits on top of the white background */}
      <div 
        className="relative bg-white z-20"
        style={{
          borderRadius: '0 0 75px 75px',
          marginBottom: '-75px'
        }}
      >
        <div className="h-[75px]"></div>
      </div>

      <section style={{ backgroundColor: '#302940', paddingTop: '155px', paddingBottom: '80px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white mb-6">
              Frequently Asked{' '}
              Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FAQ Items */}
            <div className="lg:col-span-2 space-y-1 w-full lg:pr-[10em]">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="py-2"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full text-left flex justify-between items-start group"
                  >
                    <span className="font-bold text-white pr-4 lg:pr-6 text-base lg:text-lg leading-tight">
                      {faq.question}
                    </span>
                    <div className="flex-shrink-0 ml-2 lg:ml-4 mt-1">
                      {openIndex === index ? (
                        <ChevronUp className="h-5 w-5" style={{ color: '#E4D4E5' }} />
                      ) : (
                        <ChevronDown className="h-5 w-5" style={{ color: '#E4D4E5' }} />
                      )}
                    </div>
                  </button>
                  
                  {openIndex === index && (
                    <div className="pt-3 lg:pt-4">
                      <div className="leading-relaxed" style={{ color: 'rgb(164 170 199 / 90%)' }}>
                        {faq.answer.split('\n').map((line, i, arr) => (
                          <span key={i}>
                            {line}
                            {i < arr.length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Card - Unchanged */}
            <div className="lg:col-span-1">
              <div 
                className="relative rounded-2xl text-white shadow-premium sticky top-8 overflow-hidden border-[3px] p-8"
                style={{
                  background: 'linear-gradient(135deg, #3E33C0 0%, #F666AB 100%)',
                  borderColor: '#1F0943'
                }}
              >
                {/* Pink Brush Stroke Image - Custom sized */}
                <div 
                  className="mx-auto mb-6"
                  style={{
                    width: '19rem',
                    height: '12rem',
                    backgroundImage: 'url(/Pink-BrushStroke-1.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
                
                {/* Content */}
                <div className="text-center">
                  <h3 
                    className="font-avenir font-black text-white mb-6"
                    style={{
                      fontSize: '1.75rem',
                      lineHeight: '1',
                      textAlign: 'left',
                      marginBottom: '2rem'
                    }}
                  >
                    Book a free 15 minute consultation
                  </h3>
                  
                  <Link
                    to="/booking"
                    className="w-full bg-white text-primary-pink font-semibold py-3 px-6 rounded-[15px] shadow-button-white hover:shadow-button-white-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-primary-original-dark-purple uppercase tracking-wide text-sm block text-center"
                    style={{ marginBottom: '25px' }}
                  >
                    Book a Call
                  </Link>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-avenir font-black text-white text-sm mb-1">
                        Prefer Email?
                      </p>
                      <p className="text-white/90 text-sm">
                        hello@wondrousdigital.com
                      </p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-white flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
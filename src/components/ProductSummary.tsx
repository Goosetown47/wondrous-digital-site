import React from 'react';
import { TimerReset, Rabbit, Heart, Users } from 'lucide-react';

const ProductSummary = () => {
  const features = [
    {
      icon: TimerReset,
      title: "Your time is finite. Your business's earning potential isn't.",
      description: "Missed calls = lost customers. Except when automated texts turn 70% of them into booked appointments."
    },
    {
      icon: Rabbit,
      title: "Speed beats perfect every time.",
      description: "You're 8x more likely to convert leads responding in 5 minutes vs 30. Your competitor's instant \"Got it!\" beats your perfect reply tomorrow."
    },
    {
      icon: Heart,
      title: "Small, consistent touches create big trust.",
      description: "Appointment reminders reduce no-shows by 50%. Birthday texts get 4x engagement. It's not one big gesture, it's 100 tiny proofs you care."
    },
    {
      icon: Users,
      title: "Automation isn't about being robotic, it's being more human at scale.",
      description: "Businesses using automation save 10-15 hours weekly on repetitive tasks. That's 10-15 more hours for real conversations, problem-solving, and the work only humans can do."
    }
  ];

  return (
    <section className="pt-36 pb-20 bg-primary-medium-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white mb-6 relative inline-block" style={{ lineHeight: '125%' }}>
            You don't need to work harder, just{' '}
            <span className="relative">
              smarter
              <img 
                src="/BrushStroke-Word-Underline-1.png" 
                alt="" 
                className="absolute -bottom-2 left-0 w-full h-auto"
                style={{ transform: 'translateY(5px)' }}
              />
            </span>
            .
          </h2>
          
          <p className="text-xl text-white max-w-4xl mx-auto leading-relaxed">
            We can help. We'll build you automated systems that generate and care for customers 24/7. The difference between a job and a business isn't always more effort, it's understanding these fundamental shifts in thinking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white px-8 py-8 border-[3px] border-primary-original-dark-purple group relative"
              style={{
                borderRadius: '35px',
                boxShadow: '5px 8px 0px #1F0943'
              }}
            >
              <div className="mb-6 flex justify-start">
                <feature.icon className="h-10 w-10 text-primary-pink group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              <div className="min-h-[100px] flex items-start justify-start mb-4">
                <h3 className="text-xl font-avenir font-black text-primary-original-dark-purple text-left leading-tight">
                  {feature.title}
                </h3>
              </div>
              
              <p className="text-gray-600 leading-snug font-avenir text-left">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSummary;
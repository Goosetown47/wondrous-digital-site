import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BackgroundPaths } from './ui/background-paths';

const Hero = () => {
  return (
    <div className="relative">
      <section id="home" className="relative min-h-[800px] max-h-[800px] flex items-center justify-center bg-white overflow-hidden pt-[100px]">
        {/* Background Paths */}
        <BackgroundPaths />
        
        <div className="relative max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="animate-fade-in">
            <h1 className="font-display mb-6 hero-headline" style={{ color: 'rgb(31, 10, 66)' }}>
              Get more customers<br />
              and save time.
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 max-w-full sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              We help local businesses automate their busy work, instantly follow up with leads, 
              and turn more visitors into paying customers with our smart digital platform.
            </p>
            
            <div className="animate-slide-up">
              <Link to="/booking" className="group inline-flex items-center bg-gradient-to-r from-[#F867AC] to-[#3C33C0] text-white px-8 py-4 rounded-[15px] text-lg font-semibold shadow-button-primary hover:shadow-button-primary-hover active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 border-2 border-primary-dark-purple uppercase tracking-wide">
                Book a Call
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Curved white overlay that sits on top of the purple background */}
      <div 
        className="relative bg-white z-20"
        style={{
          borderRadius: '0 0 75px 75px',
          marginBottom: '-75px'
        }}
      >
        <div className="h-[75px]"></div>
      </div>
    </div>
  );
};

export default Hero;
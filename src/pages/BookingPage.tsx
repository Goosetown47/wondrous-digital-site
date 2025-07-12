import React, { useEffect } from 'react';

const BookingPage = () => {
  useEffect(() => {
    // Load the required script for the booking widget
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row w-full gap-8">
          {/* Left Column */}
          <div className="w-full lg:w-[30%] flex flex-col">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
              Book Your Free Consultation
            </h2>
            
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Ready to transform your business with automated systems that work 24/7?
            </p>
            
            <p className="text-gray-600 leading-relaxed">
              Schedule a free 15-minute consultation to discuss how our smart digital platform can help you get more customers, save time, and automate your busy work. We'll discuss what we'd build for your business and answer any questions you have.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-pink rounded-full mr-3"></div>
                <span className="text-gray-600 text-sm">Free 15-minute consultation</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-pink rounded-full mr-3"></div>
                <span className="text-gray-600 text-sm">No commitment required</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-pink rounded-full mr-3"></div>
                <span className="text-gray-600 text-sm">Personalized business assessment</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-pink rounded-full mr-3"></div>
                <span className="text-gray-600 text-sm">Custom solution recommendations</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[70%] flex justify-center items-start">
            <div className="w-full">
              <iframe
                src="https://api.leadconnectorhq.com/widget/booking/EwQHnMp6XMw27ix9za8E"
                id="Oe5bAdDPkaFyeZwFBxCt_1751322157981"
                width="100%"
                height="600"
                style={{ border: 'none', overflow: 'hidden' }}
                title="Booking Widget"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title, 
  description = "Coming Soon" 
}) => {
  return (
    <div className="bg-white p-6 shadow-sm rounded-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default PlaceholderPage;
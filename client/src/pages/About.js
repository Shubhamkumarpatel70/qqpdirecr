import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Quantum QP</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn more about our mission to provide quality educational resources to students worldwide.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To empower students with comprehensive academic resources, including previous year questions,
              study materials, and interactive learning tools that foster academic excellence and success.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600">
              To become the leading platform for educational resources, making quality learning accessible
              to students everywhere, bridging the gap between traditional education and modern technology.
            </p>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-semibold mb-2">Comprehensive Resources</h3>
              <p className="text-gray-600 text-sm">Extensive collection of study materials and PYQs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-semibold mb-2">Quality Content</h3>
              <p className="text-gray-600 text-sm">Curated and verified educational content</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="font-semibold mb-2">Accessible Anywhere</h3>
              <p className="text-gray-600 text-sm">Learn from anywhere with our online platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

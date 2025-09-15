import React from 'react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Welcome to Quantum QP
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Your ultimate platform for academic resources, previous year questions, and more.
          Explore, learn, and excel in your studies.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg shadow-md hover:bg-gray-100 transition duration-300">
            Get Started
          </button>
          <button className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white hover:text-indigo-600 transition duration-300">
            Learn More
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

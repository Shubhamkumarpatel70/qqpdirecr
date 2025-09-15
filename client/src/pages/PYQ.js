import React from 'react';

const PYQ = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Previous Year Questions (PYQ)</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access a collection of previous year question papers to help you prepare effectively for your exams.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available PYQs</h2>
          <ul className="space-y-4">
            <li className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-center">
                <span className="font-medium text-indigo-600">Digital Electronics 2022-23</span>
                <a href="/server/uploads/1747174832094-Digital Electronics 2022-23 .pdf" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  View PDF
                </a>
              </div>
            </li>
            {/* Add more PYQ items here */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PYQ;

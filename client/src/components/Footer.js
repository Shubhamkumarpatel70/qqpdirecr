import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Quantum QP</h3>
            <p className="text-gray-400 text-sm">
              Empowering students with quality academic resources and previous year questions.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm">About</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link></li>
              <li><Link to="/pyq" className="text-gray-400 hover:text-white text-sm">PYQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Study Materials</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Mock Tests</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Tutorials</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Contact Info</h4>
            <p className="text-gray-400 text-sm">Email: info@quantumqp.com</p>
            <p className="text-gray-400 text-sm">Phone: +1 (123) 456-7890</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2024 Quantum QP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

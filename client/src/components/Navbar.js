import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchBox from './SearchBox';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../redux/slices/authSlice';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const linkClass = (path) =>
    location.pathname === path
      ? 'text-indigo-600 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-indigo-600'
      : 'text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium';

  const mobileLinkClass = (path) =>
    location.pathname === path
      ? 'text-indigo-600 block px-3 py-2 rounded-md text-base font-medium border-l-4 border-indigo-600'
      : 'text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium';

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              Quantum QP
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={linkClass('/')}>
              Home
            </Link>
            <Link to="/about" className={linkClass('/about')}>
              About
            </Link>
            <Link to="/contact" className={linkClass('/contact')}>
              Contact
            </Link>
            <Link to="/pyq" className={linkClass('/pyq')}>
              PYQ
            </Link>
            <SearchBox />
            {!isAuthenticated && (
              <>
                <Link to="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300">
                  Sign Up
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none focus:text-indigo-600"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isOpen ? (
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 0 1 1.414 1.414l-4.828 4.829 4.828 4.828z"/>
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link to="/" className={mobileLinkClass('/')} onClick={toggleMenu}>
              Home
            </Link>
            <Link to="/about" className={mobileLinkClass('/about')} onClick={toggleMenu}>
              About
            </Link>
            <Link to="/contact" className={mobileLinkClass('/contact')} onClick={toggleMenu}>
              Contact
            </Link>
            <Link to="/pyq" className={mobileLinkClass('/pyq')} onClick={toggleMenu}>
              PYQ
            </Link>
            <div className="px-3 py-2">
              <SearchBox />
            </div>
            {!isAuthenticated && (
              <>
                <Link to="/login" className={mobileLinkClass('/login')} onClick={toggleMenu}>
                  Login
                </Link>
                <Link to="/signup" className={mobileLinkClass('/signup')} onClick={toggleMenu}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

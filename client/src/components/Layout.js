import React from 'react';
import Navbar from './Navbar';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, showHeader = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {showHeader && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

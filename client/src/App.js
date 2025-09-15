import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OtpVerification from './components/OtpVerification';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import About from './pages/About';
import Contact from './pages/Contact';
import PYQ from './pages/PYQ';
import QP from './pages/QP';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pyq" element={<PYQ />} />
          <Route path="/qp" element={<QP />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<OtpVerification />} />

          {/* Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={<PrivateRoute element={<AdminDashboard />} requiredRole="admin" />}
          />

          <Route
            path="/user-dashboard"
            element={<PrivateRoute element={<UserDashboard />} />}
          />

          {/* Catch-All Route (Optional) */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;

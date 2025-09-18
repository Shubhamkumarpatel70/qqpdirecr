import React, { useState } from 'react';
import api from '../utils/axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/contact', formData);
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions or need support? Get in touch with our team.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Send Message
              </button>
            </form>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="text-indigo-600 text-xl mr-4">📧</div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">info@quantumqp.com</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-indigo-600 text-xl mr-4">📞</div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">+1 (123) 456-7890</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-indigo-600 text-xl mr-4">📍</div>
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">123 Education St, Learning City, LC 12345</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-indigo-600">Facebook</a>
                <a href="#" className="text-gray-600 hover:text-indigo-600">Twitter</a>
                <a href="#" className="text-gray-600 hover:text-indigo-600">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

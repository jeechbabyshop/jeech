import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBoxes, FaStar, FaEnvelope, FaUsers, FaImages, FaUpload, FaTrash, FaEye } from 'react-icons/fa';
import Sidebar from '../../components/Admin/Sidebar';
import BulkImageUpload from "./BulkImageUpload";
import { getProducts, getTestimonials, getMessages } from '../../services/firestore';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    testimonials: 0,
    messages: 0,
    featured: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const products = await getProducts();
      const testimonials = await getTestimonials();
      const messages = await getMessages();
      
      setStats({
        products: products.length,
        testimonials: testimonials.length,
        messages: messages.length,
        featured: products.filter(p => p.featured).length,
      });
      
      setRecentMessages(messages.slice(0, 5));
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Products', value: stats.products, icon: <FaBoxes />, color: 'bg-blue-500' },
    { title: 'Featured Items', value: stats.featured, icon: <FaStar />, color: 'bg-yellow-500' },
    { title: 'Testimonials', value: stats.testimonials, icon: <FaUsers />, color: 'bg-green-500' },
    { title: 'Messages', value: stats.messages, icon: <FaEnvelope />, color: 'bg-purple-500' },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8">
        {/* Header with Logo and Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="Jeech Baby Shop Logo" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-gray-500">Welcome back to your admin panel</p>
            </div>
          </div>
          
          {/* Action Buttons - Moved to Right */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkUpload(!showBulkUpload)}
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition shadow-md"
            >
              <FaUpload /> Bulk Upload
            </button>
            <button
              onClick={() => window.location.href = '/admin/gallery'}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition shadow-md"
            >
              <FaImages /> Gallery
            </button>
            <button
              onClick={() => window.location.href = '/admin/messages'}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-600 transition shadow-md"
            >
              <FaEnvelope /> Messages
            </button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} text-white p-3 rounded-xl`}>
                  {stat.icon}
                </div>
                <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
              </div>
              <h3 className="text-gray-600 font-medium">{stat.title}</h3>
            </motion.div>
          ))}
        </div>

        {/* Bulk Image Upload Section (Conditional) */}
        {showBulkUpload && (
          <div className="mb-8">
            <BulkImageUpload />
          </div>
        )}

        {/* Recent Messages */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaEnvelope /> Recent Messages
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading messages...</p>
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-2">Customer messages will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="border-b pb-4 last:border-0 hover:bg-gray-50 transition-colors p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{msg.name}</p>
                      <p className="text-sm text-gray-500">{msg.phone}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {msg.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
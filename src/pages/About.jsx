import React from 'react';
import { motion } from 'framer-motion';
import { FaStore, FaHeart, FaUsers, FaTrophy, FaMapMarkerAlt, FaClock, FaPhone, FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const About = () => {
  // Real stats from actual business
  const stats = [
    { icon: <FaStore className="text-4xl text-primary" />, value: "Local", label: "Family Owned" },
    { icon: <FaHeart className="text-4xl text-primary" />, value: "Quality", label: "Baby Products" },
    { icon: <FaUsers className="text-4xl text-primary" />, value: "Trusted", label: "Local Shop" },
    { icon: <FaTrophy className="text-4xl text-primary" />, value: "Best", label: "Customer Service" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-100/40 to-purple-100/40 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <img 
              src="/logo.png" 
              alt="Jeech Baby Shop Logo" 
              className="h-24 w-auto mx-auto mb-6 object-contain"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/96?text=Jeech';
              }}
            />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">About Jeech Baby Shop</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your trusted partner in providing quality baby essentials in Murang'a, Kenya
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img
  src="/jeech.jpg"
  alt="Jeech Baby Shop"
  className="rounded-2xl shadow-xl w-full h-auto object-cover"
/>
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">We Jeech</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Jeech Baby Shop was founded with a simple mission: to provide quality, affordable baby products to families in Murang'a and beyond. Starting from a small shop in Mukuyu, we've grown into a trusted name for baby essentials.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              We understand that every parent wants the best for their child. That's why we carefully select each product in our collection, ensuring they meet safety standards and quality requirements.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, we serve happy families across Kenya through our physical store and online platform. Our commitment to quality and customer satisfaction remains stronger than ever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-pink-100/30 to-purple-100/30 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              >
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Location */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Visit Our Store</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-4 text-primary">📍 Our Location</h3>
              <p className="text-gray-600 mb-6">
                Jeech Baby Shop<br/>
                Mukuyu Main Street<br/>
                Murang'a Town, Kenya<br/>
                Opposite Mukuyu Market
              </p>
              <h3 className="text-2xl font-bold mb-4 text-primary">🕒 Opening Hours</h3>
              <div className="space-y-2 text-gray-600">
                <p>Monday - Sunday: 6:00 AM - 9:00 PM</p>
                <p className="text-sm text-gray-500">Open daily including public holidays</p>
              </div>
              <div className="mt-6 space-y-3">
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=-0.7321206,37.1509362"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition w-full justify-center"
                >
                  <FaMapMarkerAlt /> Get Directions
                </a>
                <a
                  href="https://wa.me/254705797336"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition w-full justify-center"
                >
                  <FaWhatsapp /> Contact on WhatsApp
                </a>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15900!2d37.1509362!3d-0.7321206!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Jeech Baby Shop Location - Mukuyu, Murang'a, Kenya"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="container mx-auto px-4 py-16 bg-white/40 backdrop-blur-sm rounded-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Get in Touch</h2>
          <p className="text-gray-600 mt-2">Have questions? We're here to help!</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="text-center p-4">
            <FaPhone className="text-2xl text-primary mx-auto mb-2" />
            <p className="font-semibold">Phone</p>
            <a href="tel:+254705797336" className="text-gray-600">+254 705 797 336</a>
          </div>
          <div className="text-center p-4">
            <FaWhatsapp className="text-2xl text-green-500 mx-auto mb-2" />
            <p className="font-semibold">WhatsApp</p>
            <a href="https://wa.me/254705797336" className="text-gray-600">+254 705 797 336</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
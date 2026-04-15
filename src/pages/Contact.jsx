import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { addMessage } from '../services/firestore';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await addMessage(formData);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: <FaPhone className="text-2xl text-primary" />, title: "Phone", value: "+254 705 797 336", href: "tel:+254705797336" },
    { icon: <FaWhatsapp className="text-2xl text-green-500" />, title: "WhatsApp", value: "+254 705 797 336", href: "https://wa.me/254705797336" },
    { icon: <FaEnvelope className="text-2xl text-primary" />, title: "Email", value: "jeechbabyshop@gmail.com", href: "mailto:jeechbabyshop@gmail.com" },
    { icon: <FaMapMarkerAlt className="text-2xl text-primary" />, title: "Address", value: "Mukuyu, Murang'a, Kenya", href: "#" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-100/40 to-purple-100/40 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center mb-6"
          >
            <img 
              src="/logo.png" 
              alt="Jeech Baby Shop Logo" 
              className="h-24 w-auto object-contain"
            />
          </motion.div>
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold text-gray-800 mb-4"
          >
            Contact Us
          </motion.h1>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600"
          >
            We'd love to hear from you. Get in touch with us!
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, index) => (
              <motion.a
                key={index}
                href={info.href}
                target={info.href.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                initial={{ x: -30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  {info.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{info.title}</h3>
                  <p className="text-gray-600">{info.value}</p>
                </div>
              </motion.a>
            ))}

            <motion.div
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-center text-white"
            >
              <FaClock className="text-4xl mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Quick Response</h3>
              <p>We typically respond within 30 minutes on WhatsApp</p>
              <a
                href="https://wa.me/254705797336"
                className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-2 rounded-full mt-4 font-semibold hover:shadow-lg transition-all"
              >
                <FaWhatsapp /> Chat Now
              </a>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white/80"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white/80"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white/80"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white/80"
                  placeholder="Tell us what you're looking for..."
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Google Map Section with Exact Location */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Find Us Here</h2>
            <p className="text-gray-600">Visit our shop in Murang'a - Mukuyu</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
            <div className="relative w-full h-[400px] md:h-[450px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15900!2d37.1509362!3d-0.7321206!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                title="Jeech Baby Shop Location - Mukuyu, Murang'a, Kenya"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            
            {/* Map Info Overlay */}
            <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-primary text-xl" />
                  <div>
                    <p className="font-semibold text-gray-800">Jeech Baby Shop</p>
                    <p className="text-sm text-gray-600">Mukuyu, Murang'a, Kenya</p>
                    <p className="text-xs text-gray-400">Coordinates: -0.7321206, 37.1509362</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a 
                    href="https://www.google.com/maps/dir/?api=1&destination=-0.7321206,37.1509362"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition flex items-center gap-2"
                  >
                    <FaMapMarkerAlt size={14} /> Get Directions
                  </a>
                  <a 
                    href="https://www.google.com/maps/place/-0.7321206,37.1509362"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
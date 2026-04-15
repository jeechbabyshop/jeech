import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FloatingWhatsApp = () => {
  const phoneNumber = import.meta.env.VITE_SHOP_PHONE_NUMBER || '254705797336';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hello%20Jeech%20Baby%20Shop%2C%20I%27d%20like%20to%20inquire%20about%20your%20baby%20products.`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full shadow-lg z-50 hover:bg-green-600 transition-all"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <FaWhatsapp size={32} />
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
        !
      </span>
    </motion.a>
  );
};

export default FloatingWhatsApp;
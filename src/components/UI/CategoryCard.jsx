import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CategoryCard = ({ name, icon, color, count }) => {
  return (
    <Link to={`/shop?category=${name.toLowerCase()}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`${color} rounded-2xl p-6 text-center cursor-pointer transition-all hover:shadow-xl`}
      >
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{name}</h3>
        <p className="text-sm text-gray-600">{count} products</p>
      </motion.div>
    </Link>
  );
};

export default CategoryCard;
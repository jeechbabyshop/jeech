import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[400px]">
      {/* Main spinner */}
      <motion.div
        className="relative w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-pink-200"></div>
        
        {/* Animated inner ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"></div>
        
        {/* Baby face or heart in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-2xl"
          >
            👶
          </motion.span>
        </div>
      </motion.div>
      
      {/* Loading text with dots animation */}
      <div className="mt-6 flex items-center gap-1">
        <span className="text-gray-500 font-medium">Loading</span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          className="text-primary font-bold"
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          className="text-primary font-bold"
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          className="text-primary font-bold"
        >
          .
        </motion.span>
      </div>
      
      {/* Optional: Cute message */}
      <p className="text-xs text-gray-400 mt-2">Getting cute baby products ready...</p>
    </div>
  );
};

export default Loader;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaEye, FaHeart, FaRegHeart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const whatsappMessage = `Hello Jeech Baby Shop,%0AI want to order:%0AProduct: ${product.name}%0APrice: KES ${product.price.toLocaleString()}%0ACategory: ${product.category}`;
  const whatsappUrl = `https://wa.me/254705797336?text=${whatsappMessage}`;

  const imageUrl = imageError 
    ? 'https://via.placeholder.com/400x400?text=No+Image'
    : product.images?.[0] || 'https://via.placeholder.com/400x400?text=Product+Image';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group relative border border-gray-100"
    >
      {/* Wishlist Button */}
      <button
        onClick={() => setIsWishlisted(!isWishlisted)}
        className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-pink-500 hover:text-white transition-all"
      >
        {isWishlisted ? <FaHeart className="text-red-500" size={14} /> : <FaRegHeart size={14} />}
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } group-hover:scale-105`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        
        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            ⭐ Featured
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Category */}
        <p className="text-xs text-gray-400 uppercase mb-1">{product.category}</p>
        
        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-3">
          <span className="text-lg font-bold text-pink-500">
            KES {product.price.toLocaleString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-1 text-xs"
          >
            <FaEye size={12} /> View
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-1 text-xs"
          >
            <FaWhatsapp size={12} /> Order on WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
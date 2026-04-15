import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-primary">Jeech Baby Shop</h3>
            <p className="text-gray-300 mb-4">
              Your trusted baby shop in Murang'a, Kenya. Providing quality baby essentials since 2020.
            </p>
            <div className="flex space-x-4">
              {/* Facebook Link */}
              <a 
                href="https://www.facebook.com/p/Jeech-Babyshop-61566845390164/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                <FaFacebook size={24} />
              </a>
              
              {/* TikTok Link */}
              <a 
                href="https://www.tiktok.com/@jeech8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                <FaTiktok size={24} />
              </a>
              
              {/* Instagram - Add when you have it */}
              <a 
                href="#" 
                className="text-gray-300 hover:text-primary transition-colors"
              >
                <FaInstagram size={24} />
              </a>
              
              {/* Twitter - Add when you have it */}
              <a 
                href="#" 
                className="text-gray-300 hover:text-primary transition-colors"
              >
                <FaTwitter size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-gray-300 hover:text-primary transition-colors">Shop</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/shop?category=clothes" className="text-gray-300 hover:text-primary transition-colors">Baby Clothes</Link></li>
              <li><Link to="/shop?category=shoes" className="text-gray-300 hover:text-primary transition-colors">Baby Shoes</Link></li>
              <li><Link to="/shop?category=blankets" className="text-gray-300 hover:text-primary transition-colors">Blankets</Link></li>
              <li><Link to="/shop?category=toys" className="text-gray-300 hover:text-primary transition-colors">Toys</Link></li>
              <li><Link to="/shop?category=accessories" className="text-gray-300 hover:text-primary transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-primary" />
                <span className="text-gray-300">Murang'a - Mukuyu, Kenya</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-primary" />
                <a href="tel:+254705797336" className="text-gray-300 hover:text-primary">+254 705 797 336</a>
              </li>
              <li className="flex items-center space-x-3">
                <FaWhatsapp className="text-green-500" />
                <a href="https://wa.me/254705797336" className="text-gray-300 hover:text-primary">WhatsApp Us</a>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-primary" />
                <a href="mailto:jeechbabyshop@gmail.com" className="text-gray-300 hover:text-primary">jeechbabyshop@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {currentYear} Jeech Baby Shop. All rights reserved. | Made with ❤️ in Murang'a, Kenya
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
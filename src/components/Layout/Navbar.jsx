import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../UI/NotificationBell';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    let keyPressCount = 0;
    let keyPressTimer = null;
    
    const handleKeyPress = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        keyPressCount++;
        
        if (keyPressTimer) {
          clearTimeout(keyPressTimer);
        }
        
        keyPressTimer = setTimeout(() => {
          keyPressCount = 0;
        }, 1000);
        
        if (keyPressCount === 3) {
          navigate('/admin-login');
          keyPressCount = 0;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyPress);
      if (keyPressTimer) clearTimeout(keyPressTimer);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogoDoubleClick = () => {
    navigate('/admin-login');
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-gradient-to-r from-pink-100/90 to-purple-100/90 backdrop-blur-sm'
    }`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-pink-300/30 rounded-full animate-float"></div>
        <div className="absolute top-20 right-10 w-20 h-20 bg-pink-400/20 rounded-full animate-float delay-100"></div>
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-purple-300/20 rounded-full animate-float delay-200"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-pink-300/25 rounded-full animate-float delay-300"></div>
        <div className="absolute -bottom-10 right-20 w-28 h-28 bg-pink-400/20 rounded-full animate-float delay-400"></div>
        <div className="absolute top-10 left-1/4 w-12 h-12 bg-purple-400/20 rounded-full animate-float delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-3 relative z-10">
        <div className="flex justify-between items-center">
          {/* Logo and Shop Name - Adaptive */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img 
                src="/logo.png" 
                alt="Jeech Baby Shop Logo" 
                className="h-8 sm:h-10 md:h-14 w-auto object-contain relative z-10 group-hover:scale-105 transition-transform cursor-pointer drop-shadow-lg"
                onDoubleClick={handleLogoDoubleClick}
                title="Double-click logo for admin access"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-xl font-bold text-gray-800 drop-shadow-sm truncate">
                JEECH BABY SHOP
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-600 font-medium hidden xs:block">
                Murang'a - Mukuyu
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-pink-600 transition-colors font-medium relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all group-hover:w-full"></span>
              </Link>
            ))}
            
            {user && (
              <>
                <NotificationBell />
                <Link to="/admin" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-600 font-medium">
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Right Section - Bell + Menu Button */}
          <div className="flex items-center gap-1 sm:gap-2 md:hidden flex-shrink-0">
            {/* Notification Bell - Always visible on mobile */}
            {user && <NotificationBell />}
            
            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="text-xl sm:text-2xl p-2 z-20 relative">
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-4 space-y-3 pb-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-gray-700 hover:text-pink-600 transition-colors py-2"
              >
                {link.name}
              </Link>
            ))}
            
            {user && (
              <>
                <Link 
                  to="/admin" 
                  onClick={() => setIsOpen(false)} 
                  className="block text-gray-700 hover:text-pink-600 transition-colors py-2"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }} 
                  className="block text-red-500 hover:text-red-600 py-2 w-full text-left"
                >
                  Logout
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
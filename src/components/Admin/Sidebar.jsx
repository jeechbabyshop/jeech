import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaBoxes, 
  FaStar, 
  FaEnvelope, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaImages,
  FaUpload
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/admin', name: 'Dashboard', icon: <FaHome /> },
    { path: '/admin/products', name: 'Products', icon: <FaBoxes /> },
    { path: '/admin/bulk-upload', name: 'Bulk Upload', icon: <FaUpload /> }, // Add this
    { path: '/admin/gallery', name: 'Gallery', icon: <FaImages /> }, // Add this
    { path: '/admin/testimonials', name: 'Testimonials', icon: <FaStar /> },
    { path: '/admin/messages', name: 'Messages', icon: <FaEnvelope /> },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="Jeech Baby Shop Logo" 
            className="h-10 w-auto object-contain"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <p className="text-xs text-gray-500">Jeech Baby Shop</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-pink-50'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors mt-4"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-colors"
        >
          {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar (Overlay) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Always Visible) */}
      <div className="hidden lg:block w-64 bg-white shadow-lg min-h-screen">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import FloatingWhatsApp from "./components/Layout/FloatingWhatsApp";  
import BackgroundEffects from './components/Layout/BackgroundEffects';
import FloatingInstallButton from './components/UI/FloatingInstallButton';
import SplashScreen from './components/UI/SplashScreen';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import ImageGallery from './pages/ImageGallery';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Admin/Dashboard';
import Products from './pages/Admin/Products';
import BulkUpload from './pages/Admin/BulkImageUpload';
import GalleryManage from './pages/Admin/GalleryManage';
import Testimonials from './pages/Admin/Testimonials';
import Messages from './pages/Admin/Messages';
import ProtectedRoute from './components/Admin/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white relative">
          <SplashScreen />
          <BackgroundEffects />
          <Navbar />
          <main className="relative z-10 pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={<ImageGallery />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/admin/bulk-upload" element={<ProtectedRoute><BulkUpload /></ProtectedRoute>} />
              <Route path="/admin/gallery" element={<ProtectedRoute><GalleryManage /></ProtectedRoute>} />
              <Route path="/admin/testimonials" element={<ProtectedRoute><Testimonials /></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
          <FloatingWhatsApp />
          <FloatingInstallButton />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
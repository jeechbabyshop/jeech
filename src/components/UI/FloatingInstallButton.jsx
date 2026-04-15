import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaApple, FaAndroid } from 'react-icons/fa';

const FloatingInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const userAgent = navigator.userAgent;
    const mobile = /android|iphone|ipad|ipod/i.test(userAgent);
    const ios = /iphone|ipad|ipod/i.test(userAgent);
    
    setIsMobile(mobile);
    setIsIOS(ios);

    // For Android - listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // FOR MOBILE: Always show button on mobile devices
    if (mobile) {
      setShowButton(true);
    }
    
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) {
      setShowButton(false);
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android - native install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowButton(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS - show instructions
      alert('To install on iPhone:\n1. Tap Share button\n2. Scroll down\n3. Tap "Add to Home Screen"');
    } else {
      // Other browsers
      alert('To install: Click the "Install" icon in the browser address bar');
    }
  };

  if (!showButton) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleInstall}
      className="fixed bottom-8 left-4 z-50 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
    >
      {isIOS ? <FaApple size={20} /> : <FaAndroid size={20} />}
      <FaDownload size={18} />
    </motion.button>
  );
};

export default FloatingInstallButton;
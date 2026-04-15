import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaAndroid, FaApple, FaWindows } from 'react-icons/fa';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent;
    if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      setPlatform('ios');
    } else {
      setPlatform('desktop');
    }

    // Listen for install prompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if already installed
    window.addEventListener('appinstalled', () => {
      setShowButton(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowButton(false);
    }
    
    setDeferredPrompt(null);
  };

  const getIcon = () => {
    switch(platform) {
      case 'android': return <FaAndroid className="text-green-500" />;
      case 'ios': return <FaApple className="text-gray-800" />;
      default: return <FaWindows className="text-blue-500" />;
    }
  };

  const getMessage = () => {
    switch(platform) {
      case 'android': return 'Install App on Android';
      case 'ios': return 'Install on iPhone';
      default: return 'Install App';
    }
  };

  if (!showButton) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleInstall}
      className="fixed bottom-24 right-4 z-50 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 font-semibold text-sm md:text-base"
    >
      {getIcon()}
      <FaDownload className="text-white" />
      {getMessage()}
    </motion.button>
  );
};

export default InstallButton;
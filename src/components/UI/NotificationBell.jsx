import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheckDouble } from 'react-icons/fa';
import { db } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      const unreadMessages = messageList.filter(msg => !msg.read);
      
      setMessages(unreadMessages);
      const unread = messageList.filter(msg => !msg.read).length;
      setUnreadCount(unread);
      
      updateFaviconBadge(unread);
      
      if (unread > 0) {
        document.title = `(${unread}) Jeech Baby Shop`;
      } else {
        document.title = 'Jeech Baby Shop';
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Check if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Request notification permission - ONLY on desktop or if user explicitly wants
  useEffect(() => {
    // Skip notifications on mobile to prevent white screen
    if (!user || isMobile) return;
    
    if ('Notification' in window && Notification.permission !== 'granted') {
      // Don't auto-request on mobile
      setTimeout(() => {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }, 5000);
    }
  }, [user, isMobile]);

  // Show browser notification for new messages - DISABLED ON MOBILE
  useEffect(() => {
    // Skip notifications entirely on mobile to prevent white screen
    if (!user || messages.length === 0 || isMobile) return;
    
    const latestMessage = messages[0];
    if (latestMessage && !latestMessage.read) {
      if (Notification.permission === 'granted') {
        const notification = new Notification('New Message from Jeech Baby Shop', {
          body: `From: ${latestMessage.name}\nMessage: ${latestMessage.message.substring(0, 50)}...`,
          icon: '/logo.png',
          badge: '/logo.png',
          silent: true, // Prevent vibration on mobile
          data: {
            messageId: latestMessage.id,
            url: '/admin/messages'
          }
        });
        
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          markAsRead(latestMessage.id);
          navigate('/admin/messages');
          notification.close();
        };
      }
    }
  }, [messages, user, isMobile]);

  const updateFaviconBadge = (count) => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) return;
    
    if (count > 0) {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = '/logo.png';
      img.onload = () => {
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 32, 32);
        
        ctx.beginPath();
        ctx.arc(24, 8, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF4444';
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(count > 9 ? '9+' : count.toString(), 24, 8);
        
        favicon.href = canvas.toDataURL('image/png');
      };
    } else {
      favicon.href = '/logo.png';
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), { read: true });
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Message marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadMessages = messages.filter(msg => !msg.read);
      
      if (unreadMessages.length === 0) {
        toast.success('No unread messages');
        return;
      }
      
      const updatePromises = unreadMessages.map(msg => 
        updateDoc(doc(db, 'messages', msg.id), { read: true })
      );
      
      await Promise.all(updatePromises);
      
      setMessages([]);
      setUnreadCount(0);
      
      toast.success(`${unreadMessages.length} messages marked as read`);
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark messages as read');
    }
  };

  const handleOpenMessage = async (messageId) => {
    await markAsRead(messageId);
    setShowDropdown(false);
    navigate('/admin/messages');
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative text-gray-700 hover:text-pink-600 transition-colors p-2"
      >
        <FaBell size={20} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-80 md:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b bg-pink-50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <p className="text-xs text-gray-500">
                    {unreadCount === 0 ? 'No unread messages' : `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <FaCheckDouble size={10} /> Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FaBell className="text-4xl mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No unread messages</p>
                    <p className="text-xs text-gray-400 mt-1">All caught up! 🎉</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => handleOpenMessage(msg.id)}
                      className="block p-4 border-b hover:bg-gray-50 transition cursor-pointer bg-pink-50/30"
                    >
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-pink-500 animate-pulse" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-800">{msg.name}</p>
                          <p className="text-xs text-gray-500">{msg.phone}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{msg.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {msg.createdAt?.toLocaleDateString()} at {msg.createdAt?.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <Link
                to="/admin/messages"
                onClick={() => setShowDropdown(false)}
                className="block p-3 text-center text-sm text-primary font-semibold border-t hover:bg-gray-50"
              >
                View All Messages
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
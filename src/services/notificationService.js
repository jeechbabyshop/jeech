import { getMessages } from './firestore';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

let unreadCount = 0;
let listeners = [];
let lastMessageCount = 0;

// Request permission for browser notifications
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Send a browser notification
export const sendNotification = (title, body, icon = '/logo.png') => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  
  const notification = new Notification(title, {
    body: body,
    icon: icon,
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    silent: false,
  });
  
  notification.onclick = () => {
    window.focus();
    window.location.href = '/admin/messages';
  };
};

// Update favicon badge (red dot on browser tab)
export const updateFaviconBadge = (count) => {
  const favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) return;
  
  if (count > 0) {
    // Create canvas to draw badge on favicon
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = '/logo.png';
    img.onload = () => {
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 32, 32);
      
      // Draw red badge
      ctx.beginPath();
      ctx.arc(24, 8, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#FF4444';
      ctx.fill();
      
      // Draw count text
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

// Update document title with badge
export const updateTitleBadge = (count) => {
  const originalTitle = document.title;
  if (count > 0) {
    document.title = `(${count}) ${originalTitle.replace(/^\(\d+\)\s/, '')}`;
  } else {
    document.title = originalTitle.replace(/^\(\d+\)\s/, '');
  }
};

// Listen for new messages in real-time
export const listenForNewMessages = (onNewMessage) => {
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const unreadMessages = messages.filter(msg => !msg.read);
    const newCount = unreadMessages.length;
    
    // Check for genuinely new messages (not just unread count change)
    const currentMessageIds = messages.map(m => m.id);
    const newMessageIds = currentMessageIds.filter(id => !lastMessageCount);
    
    if (newMessageIds.length > 0 && lastMessageCount > 0) {
      const newestMessage = messages[0];
      onNewMessage?.(newestMessage);
      sendNotification(
        'New Message from Jeech Baby Shop',
        `From: ${newestMessage.name}\nMessage: ${newestMessage.message.substring(0, 50)}...`
      );
    }
    
    lastMessageCount = messages.length;
    
    // Update all listeners
    listeners.forEach(listener => listener(newCount));
  });
};

// Subscribe to unread count changes
export const subscribeToUnreadCount = (callback) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

// Get current unread count
export const getUnreadCount = () => {
  return unreadCount;
};

// Update unread count (called from components)
export const setUnreadCount = (count) => {
  unreadCount = count;
  updateFaviconBadge(count);
  updateTitleBadge(count);
  listeners.forEach(listener => listener(count));
};
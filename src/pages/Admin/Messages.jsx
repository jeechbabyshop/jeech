import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaUser, FaCalendar, FaReply, FaWhatsapp, FaCheck, FaEye, FaTrash } from 'react-icons/fa';
import Sidebar from '../../components/Admin/Sidebar';
import { getMessages } from '../../services/firestore';
import { db } from '../../services/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [popupShown, setPopupShown] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const data = await getMessages();
    setMessages(data);
    setLoading(false);
  };

  const markAsRead = async (messageId) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), { read: true });
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => ({ ...prev, read: true }));
      }
      toast.success('Message marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAsUnread = async (messageId) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), { read: false });
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: false } : msg
      ));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => ({ ...prev, read: false }));
      }
      toast.success('Message marked as unread');
    } catch (error) {
      console.error('Error marking as unread:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'messages', messageId));
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        toast.success('Message deleted successfully');
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Failed to delete message');
      }
    }
  };

  const deleteAllMessages = async () => {
    if (window.confirm(`Are you sure you want to delete ALL ${messages.length} messages? This action cannot be undone.`)) {
      try {
        const deletePromises = messages.map(msg => deleteDoc(doc(db, 'messages', msg.id)));
        await Promise.all(deletePromises);
        setMessages([]);
        setSelectedMessage(null);
        toast.success('All messages deleted successfully');
      } catch (error) {
        console.error('Error deleting all messages:', error);
        toast.error('Failed to delete all messages');
      }
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
      
      setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
      if (selectedMessage && !selectedMessage.read) {
        setSelectedMessage(prev => ({ ...prev, read: true }));
      }
      
      toast.success(`${unreadMessages.length} messages marked as read`);
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark messages as read');
    }
  };

  const handleReply = (phone, message) => {
    const replyText = `Hello, thank you for contacting Jeech Baby Shop. We received your message: "${message.substring(0, 50)}..." How can we help you today?`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(replyText)}`;
    window.open(whatsappUrl, '_blank');
    
    if (selectedMessage && !selectedMessage.read) {
      markAsRead(selectedMessage.id);
    }
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      markAsRead(msg.id);
    }
  };

  // Show popup only once when there are unread messages
  useEffect(() => {
    const unreadCount = messages.filter(m => !m.read).length;
    if (unreadCount > 0 && !popupShown && !loading) {
      setPopupShown(true);
      toast.custom((t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm w-full border-l-4 border-pink-500">
          <div className="flex items-start gap-3">
            <div className="bg-pink-100 rounded-full p-2">
              <FaEnvelope className="text-pink-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">You have unread messages!</p>
              <p className="text-xs text-gray-600 mt-1">{unreadCount} new message{unreadCount > 1 ? 's' : ''} waiting for you</p>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="text-gray-400">✕</button>
          </div>
        </div>
      ), { duration: 5000 });
    }
  }, [messages, loading, popupShown]);

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Customer Messages</h1>
          <div className="flex gap-3">
            {messages.length > 0 && (
              <button
                onClick={deleteAllMessages}
                className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition"
              >
                <FaTrash /> Delete All ({messages.length})
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition"
              >
                <FaCheck /> Mark All Read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">All Messages ({messages.length})</h2>
              <span className="text-xs text-pink-500">
                {unreadCount} unread
              </span>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No messages yet</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`relative group ${
                      selectedMessage?.id === msg.id ? 'bg-pink-50' : ''
                    } ${!msg.read ? 'border-l-4 border-pink-500' : ''}`}
                  >
                    <button
                      onClick={() => handleSelectMessage(msg)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors pr-12"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <FaUser className={`${!msg.read ? 'text-pink-500' : 'text-gray-400'}`} />
                          <span className={`font-semibold ${!msg.read ? 'text-pink-600' : 'text-gray-800'}`}>
                            {msg.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {msg.createdAt?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <FaPhone size={10} /> {msg.phone}
                        </div>
                        {!msg.read && (
                          <span className="text-xs text-pink-500 font-medium">New</span>
                        )}
                        {msg.read && (
                          <FaCheck size={10} className="text-green-500" />
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                      title="Delete message"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            {selectedMessage ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h2 className="text-2xl font-bold text-gray-800">{selectedMessage.name}</h2>
                        {!selectedMessage.read && (
                          <span className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                        {selectedMessage.read && (
                          <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <FaCheck size={10} /> Read
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                        <span className="flex items-center gap-1">
                          <FaPhone /> {selectedMessage.phone}
                        </span>
                        {selectedMessage.email && (
                          <span className="flex items-center gap-1">
                            <FaEnvelope /> {selectedMessage.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FaCalendar /> {selectedMessage.createdAt?.toDate().toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedMessage.read ? (
                        <button
                          onClick={() => markAsUnread(selectedMessage.id)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600"
                        >
                          <FaEye /> Mark Unread
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsRead(selectedMessage.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
                        >
                          <FaCheck /> Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600"
                      >
                        <FaTrash /> Delete
                      </button>
                      <button
                        onClick={() => handleReply(selectedMessage.phone, selectedMessage.message)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
                      >
                        <FaWhatsapp /> Reply on WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Message:</h3>
                  <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-semibold text-gray-700 mb-2">Quick Actions:</h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      Call Customer
                    </a>
                    <button
                      onClick={() => handleReply(selectedMessage.phone, selectedMessage.message)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition"
                    >
                      <FaReply /> Reply via WhatsApp
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <FaEnvelope className="text-6xl mx-auto mb-4" />
                  <p>Select a message to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
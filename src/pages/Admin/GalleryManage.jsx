import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaEye, FaCopy, FaCheck, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Sidebar from '../../components/Admin/Sidebar';
import { supabase, PRODUCTS_BUCKET } from '../../services/supabase';
import toast from 'react-hot-toast';

const GalleryManage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from(PRODUCTS_BUCKET)
        .list('', {
          limit: 200,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) throw error;
      
      const imageList = data
        .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
        .map(file => ({
          id: file.id,
          name: file.name,
          url: supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(file.name).data.publicUrl,
          created_at: file.created_at,
          size: (file.metadata?.size / 1024).toFixed(2)
        }));
      
      setImages(imageList);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageName, imageId) => {
    if (window.confirm(`Delete "${imageName}"? This action cannot be undone.`)) {
      try {
        const { error } = await supabase.storage
          .from(PRODUCTS_BUCKET)
          .remove([imageName]);
        
        if (error) throw error;
        
        setImages(prev => prev.filter(img => img.id !== imageId));
        if (previewImage?.id === imageId) setPreviewImage(null);
        toast.success('Image deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete image');
      }
    }
  };

  const deleteSelected = async () => {
    if (selectedImages.length === 0) return;
    
    if (window.confirm(`Delete ${selectedImages.length} images? This cannot be undone.`)) {
      try {
        const filesToDelete = selectedImages.map(id => {
          const img = images.find(i => i.id === id);
          return img?.name;
        }).filter(Boolean);
        
        const { error } = await supabase.storage
          .from(PRODUCTS_BUCKET)
          .remove(filesToDelete);
        
        if (error) throw error;
        
        setImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
        setSelectedImages([]);
        toast.success(`${selectedImages.length} images deleted`);
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete images');
      }
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const toggleSelect = (imageId) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const selectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map(img => img.id));
    }
  };

  const handleImageLoad = (imageId) => {
    setLoadedImages(prev => ({ ...prev, [imageId]: true }));
  };

  const handlePreviewLoad = () => {
    setPreviewLoaded(true);
  };

  const goToPrevImage = () => {
    if (!previewImage) return;
    const currentIndex = images.findIndex(img => img.id === previewImage.id);
    if (currentIndex > 0) {
      setPreviewLoaded(false);
      setPreviewImage(images[currentIndex - 1]);
    }
  };

  const goToNextImage = () => {
    if (!previewImage) return;
    const currentIndex = images.findIndex(img => img.id === previewImage.id);
    if (currentIndex < images.length - 1) {
      setPreviewLoaded(false);
      setPreviewImage(images[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!previewImage) return;
      if (e.key === 'ArrowLeft') goToPrevImage();
      if (e.key === 'ArrowRight') goToNextImage();
      if (e.key === 'Escape') setPreviewImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage, images]);

  const BabyLoadingFace = () => (
    <div className="flex flex-col items-center justify-center p-4">
      <motion.div
        animate={{ y: [0, -5, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-5xl mb-2"
      >
        👶
      </motion.div>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-xs text-gray-400"
      >
        Loading...
      </motion.div>
    </div>
  );

  const PreviewBabyLoadingFace = () => (
    <div className="flex flex-col items-center justify-center min-w-[400px] min-h-[400px]">
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="text-6xl mb-3"
      >
        👶
      </motion.div>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-sm text-pink-400 font-medium"
      >
        Loading image...
      </motion.div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gallery Manager</h1>
            <p className="text-gray-500">Manage all uploaded images</p>
          </div>
          {selectedImages.length > 0 && (
            <button
              onClick={deleteSelected}
              className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition"
            >
              <FaTrash /> Delete Selected ({selectedImages.length})
            </button>
          )}
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Total Images: {images.length}</p>
            {images.length > 0 && (
              <button onClick={selectAll} className="text-sm text-primary hover:underline">
                {selectedImages.length === images.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-7xl mb-4"
            >
              👶
            </motion.div>
            <p className="text-gray-500">Loading your gallery...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-500 text-lg">No images uploaded yet</p>
            <p className="text-gray-400 text-sm mt-2">Use Bulk Upload to add images</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative group rounded-xl overflow-hidden border-2 transition ${
                  selectedImages.includes(image.id) ? 'border-primary shadow-lg' : 'border-transparent'
                }`}
              >
                <div 
                  className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 relative cursor-pointer"
                  onClick={() => {
                    setPreviewLoaded(false);
                    setPreviewImage(image);
                  }}
                >
                  {!loadedImages[image.id] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                      <BabyLoadingFace />
                    </div>
                  )}
                  <img
                    src={`${image.url}?width=200&height=200&quality=50`}
                    alt={image.name}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                      loadedImages[image.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(image.id)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200?text=Error';
                      handleImageLoad(image.id);
                    }}
                  />
                  
                  <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewLoaded(false);
                        setPreviewImage(image);
                      }}
                      className="bg-white p-1.5 rounded-full hover:bg-primary hover:text-white transition shadow-md text-xs"
                      title="View"
                    >
                      <FaEye size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(image.url);
                      }}
                      className="bg-white p-1.5 rounded-full hover:bg-primary hover:text-white transition shadow-md text-xs"
                      title="Copy URL"
                    >
                      <FaCopy size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(image.name, image.id);
                      }}
                      className="bg-white p-1.5 rounded-full hover:bg-red-500 hover:text-white transition shadow-md text-xs"
                      title="Delete"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
                
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image.id)}
                    onChange={() => toggleSelect(image.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-white/90 cursor-pointer"
                  />
                </div>
                
                <p className="text-xs text-gray-500 p-1.5 truncate bg-white/80 text-center">{image.name.split('_').pop()}</p>
                
                {loadedImages[image.id] && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5">
                    <FaCheck size={8} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal - Transparent Background with Baby Loading Face */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition z-20"
            >
              <FaTimes size={20} className="text-white" />
            </button>
            
            {/* Previous Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              disabled={images.findIndex(img => img.id === previewImage.id) === 0}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition z-20 ${
                images.findIndex(img => img.id === previewImage.id) === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
              }`}
            >
              <FaArrowLeft size={20} className="text-white" />
            </button>
            
            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              disabled={images.findIndex(img => img.id === previewImage.id) === images.length - 1}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition z-20 ${
                images.findIndex(img => img.id === previewImage.id) === images.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
              }`}
            >
              <FaArrowRight size={20} className="text-white" />
            </button>
            
            {/* Image Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-5xl max-h-[85vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Baby Loading Face while image loads */}
              {!previewLoaded && (
                <div className="min-w-[400px] min-h-[400px] flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl">
                  <PreviewBabyLoadingFace />
                </div>
              )}
              
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className={`max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-opacity duration-500 ${
                  previewLoaded ? 'opacity-100' : 'opacity-0 absolute'
                }`}
                onLoad={handlePreviewLoad}
              />
              
              {previewLoaded && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-white font-medium mb-1">{previewImage.name}</p>
                  <div className="flex justify-between items-center text-white/70 text-xs mb-3">
                    <span>Size: {previewImage.size} KB</span>
                    <span>{images.findIndex(img => img.id === previewImage.id) + 1} of {images.length}</span>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => copyUrl(previewImage.url)}
                      className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition flex items-center gap-2 text-sm text-white"
                    >
                      <FaCopy size={14} /> Copy URL
                    </button>
                    <button
                      onClick={() => {
                        deleteImage(previewImage.name, previewImage.id);
                        setPreviewImage(null);
                      }}
                      className="bg-red-500/80 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2 text-sm text-white"
                    >
                      <FaTrash size={14} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryManage;
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaWhatsapp, FaTimes, FaDownload, FaShare, FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { supabase, PRODUCTS_BUCKET } from '../services/supabase';
import Loader from '../components/UI/Loader';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();
  const imagesPerPage = 20;

  useEffect(() => {
    fetchAllImages();
  }, []);

  const fetchAllImages = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.storage
        .from(PRODUCTS_BUCKET)
        .list('', {
          limit: 200,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) throw error;
      
      const imageUrls = data
        .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
        .map(file => ({
          id: file.id,
          name: file.name,
          url: supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(file.name).data.publicUrl,
          thumbnail: `${supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(file.name).data.publicUrl}?width=200&height=200&quality=50`,
          optimized: `${supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(file.name).data.publicUrl}?width=600&height=600&quality=80`,
          created_at: file.created_at,
          size: (file.metadata?.size / 1024).toFixed(2)
        }));
      
      setImages(imageUrls);
      setFilteredImages(imageUrls);
      setHasMore(imageUrls.length > imagesPerPage);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = images.filter(img => 
        img.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredImages(filtered);
      setPage(1);
    } else {
      setFilteredImages(images);
    }
  }, [searchTerm, images]);

  // Pagination - show only current page images
  const displayedImages = filteredImages.slice(0, page * imagesPerPage);
  const hasMoreImages = displayedImages.length < filteredImages.length;

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (loading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreImages) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, [loading, hasMoreImages]);

  const toggleWishlist = (imageId) => {
    setWishlist(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const shareImage = (imageUrl, imageName) => {
    navigator.clipboard.writeText(imageUrl);
    alert(`Image URL copied! Share this link: ${imageUrl}`);
  };

  const downloadImage = async (imageUrl, imageName) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = imageName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const orderOnWhatsApp = (imageUrl, imageName) => {
    const message = `Hello Jeech Baby Shop,%0AI'm interested in this product:%0AProduct: ${imageName}%0APlease let me know the price and availability.`;
    const whatsappUrl = `https://wa.me/254705797336?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleImageLoad = (imageId) => {
    setLoadedImages(prev => ({ ...prev, [imageId]: true }));
  };

  // Navigate through images in lightbox
  const nextImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage?.id);
    if (currentIndex < filteredImages.length - 1) {
      setSelectedImage(filteredImages[currentIndex + 1]);
    }
  };

  const prevImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage?.id);
    if (currentIndex > 0) {
      setSelectedImage(filteredImages[currentIndex - 1]);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, filteredImages]);

  // Baby loading face component
  const BabyLoadingFace = () => (
    <div className="flex flex-col items-center justify-center p-4">
      <motion.div
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 1.2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-5xl mb-2"
      >
        👶
      </motion.div>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-xs text-pink-400 font-medium"
      >
        Loading...
      </motion.div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <img 
          src="/logo.png" 
          alt="Jeech Baby Shop Logo" 
          className="h-20 w-auto mx-auto mb-4 object-contain"
        />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Product Gallery</h1>
        <p className="text-gray-600">Browse all our product images - Order anything you like!</p>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-8 max-w-md mx-auto">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white/80 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="text-center mb-6">
        <p className="text-gray-500">
          {filteredImages.length} images • {wishlist.length} in wishlist
        </p>
      </div>

      {/* Image Grid with Baby Loading Face */}
      {loading ? (
        <Loader />
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-gray-500 text-lg">No images found</p>
          <p className="text-gray-400 text-sm mt-2">Check back later for new products!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedImages.map((image, idx) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.01, 0.5) }}
                className="group relative cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                {/* Lazy loading with BABY FACE */}
                <div className="aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 shadow-md relative">
                  {!loadedImages[image.id] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BabyLoadingFace />
                    </div>
                  )}
                  <img
                    src={image.thumbnail}
                    alt={image.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      loadedImages[image.id] ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    } group-hover:scale-110`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(image.id)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                      handleImageLoad(image.id);
                    }}
                  />
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(image.id);
                    }}
                    className="bg-white p-2 rounded-full hover:bg-primary hover:text-white transition"
                  >
                    {wishlist.includes(image.id) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareImage(image.url, image.name);
                    }}
                    className="bg-white p-2 rounded-full hover:bg-primary hover:text-white transition"
                  >
                    <FaShare />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(image.url, image.name);
                    }}
                    className="bg-white p-2 rounded-full hover:bg-primary hover:text-white transition"
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      orderOnWhatsApp(image.url, image.name);
                    }}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition"
                  >
                    <FaWhatsapp />
                  </button>
                </div>
                
                {/* Image name */}
                <p className="text-xs text-gray-500 mt-1 truncate text-center">
                  {image.name.length > 30 ? image.name.substring(0, 27) + '...' : image.name}
                </p>
                
                {/* Loaded checkmark */}
                {loadedImages[image.id] && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5 text-[10px]">
                    ✓
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Infinite scroll trigger with baby face */}
          {hasMoreImages && (
            <div ref={observerRef} className="flex justify-center py-8">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-3xl"
                >
                  👶
                </motion.div>
                <p className="text-xs text-gray-400 mt-1">Loading more...</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lightbox Modal for viewing full-size images */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition"
          >
            <FaTimes />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 text-white text-3xl hover:text-gray-300 transition disabled:opacity-50"
          >
            <FaChevronLeft />
          </button>
          
          <div className="max-w-4xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.optimized || selectedImage.url}
              alt={selectedImage.name}
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="mt-4 text-center text-white">
              <p className="text-sm mb-2">{selectedImage.name}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => downloadImage(selectedImage.url, selectedImage.name)}
                  className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition flex items-center gap-2"
                >
                  <FaDownload /> Download
                </button>
                <button
                  onClick={() => shareImage(selectedImage.url, selectedImage.name)}
                  className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition flex items-center gap-2"
                >
                  <FaShare /> Share
                </button>
                <button
                  onClick={() => orderOnWhatsApp(selectedImage.url, selectedImage.name)}
                  className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                >
                  <FaWhatsapp /> Order on WhatsApp
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 text-white text-3xl hover:text-gray-300 transition"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaBabyCarriage, FaShieldAlt, FaTruck, FaStar, FaArrowRight, FaShoppingBag, FaClock, FaLeaf, FaReply, FaChevronLeft, FaChevronRight, FaPause, FaPlay, FaImages } from 'react-icons/fa';
import ProductCard from '../components/UI/ProductCard';
import CategoryCard from '../components/UI/CategoryCard';
import Loader from '../components/UI/Loader';
import { getProducts, getTestimonials } from '../services/firestore';
import { supabase, PRODUCTS_BUCKET } from '../services/supabase';

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [loadedGalleryImages, setLoadedGalleryImages] = useState({});
  
  // Slider state
  const [sliderImages, setSliderImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState({});

  // Fetch gallery images from Supabase
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const { data, error } = await supabase.storage
          .from(PRODUCTS_BUCKET)
          .list('', {
            limit: 20,
            sortBy: { column: 'created_at', order: 'desc' }
          });
        
        if (error) throw error;
        
        const imageUrls = data
          .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
          .slice(0, 8)
          .map(file => ({
            id: file.id,
            name: file.name,
            url: supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(file.name).data.publicUrl,
            thumbnail: `${supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(file.name).data.publicUrl}?width=200&height=200&quality=50`,
          }));
        
        setGalleryImages(imageUrls);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setGalleryLoading(false);
      }
    };
    
    fetchGalleryImages();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const products = await getProducts();
        console.log('Products loaded:', products.length);
        
        const reviews = await getTestimonials();
        
        const counts = {
          clothes: products.filter(p => p.category === 'clothes' || p.category === 'Baby Clothes' || p.category === 'baby clothes').length,
          shoes: products.filter(p => p.category === 'shoes' || p.category === 'Baby Shoes' || p.category === 'baby shoes').length,
          blankets: products.filter(p => p.category === 'blankets' || p.category === 'Blankets').length,
          toys: products.filter(p => p.category === 'toys' || p.category === 'Toys').length,
          accessories: products.filter(p => p.category === 'accessories' || p.category === 'Accessories').length,
        };
        
        setAllProducts(products || []);
        setTestimonials(reviews || []);
        setCategoryCounts(counts);
        
        // Extract images from products for slider
        const productImages = products
          .filter(p => p.images && p.images.length > 0 && p.images[0])
          .slice(0, 10)
          .map(p => ({
            url: p.images[0],
            name: p.name,
            price: p.price,
            id: p.id
          }));
        
        setSliderImages(productImages);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying || sliderImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, sliderImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleImageLoad = (imageId) => {
    setLoadedImages(prev => ({ ...prev, [imageId]: true }));
  };

  const handleGalleryImageLoad = (imageId) => {
    setLoadedGalleryImages(prev => ({ ...prev, [imageId]: true }));
  };

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
        className="text-4xl mb-2"
      >
        👶
      </motion.div>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-xs text-[#800020] font-medium"
      >
        Loading...
      </motion.div>
    </div>
  );

  const categories = [
    { displayName: 'Baby Clothes', icon: '👕', bgColor: 'bg-white/80 backdrop-blur-sm', categoryKey: 'clothes' },
    { displayName: 'Baby Shoes', icon: '👟', bgColor: 'bg-white/80 backdrop-blur-sm', categoryKey: 'shoes' },
    { displayName: 'Blankets', icon: '🛌', bgColor: 'bg-white/80 backdrop-blur-sm', categoryKey: 'blankets' },
    { displayName: 'Toys', icon: '🧸', bgColor: 'bg-white/80 backdrop-blur-sm', categoryKey: 'toys' },
    { displayName: 'Accessories', icon: '🎀', bgColor: 'bg-white/80 backdrop-blur-sm', categoryKey: 'accessories' },
  ];

  const benefits = [
    { icon: <FaBabyCarriage className="text-4xl" />, title: 'Quality Products', desc: 'Safe & tested baby essentials', color: 'text-[#800020]' },
    { icon: <FaWhatsapp className="text-4xl" />, title: 'Fast WhatsApp Ordering', desc: 'Order in seconds via WhatsApp', color: 'text-green-500' },
    { icon: <FaShieldAlt className="text-4xl" />, title: 'Trusted Local Shop', desc: 'Serving Murang\'a since 2020', color: 'text-blue-500' },
    { icon: <FaReply className="text-4xl" />, title: 'Fast reply', desc: 'Quick responses to your queries', color: 'text-purple-500' },
  ];

  const previewProducts = allProducts.slice(0, 8);
  const hasProducts = allProducts.length > 0;

  return (
    <div>
      {/* Hero Section with Image Slider */}
      <section className="relative bg-gradient-to-br from-white via-white/30 to-gray-100/40 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 bg-[#800020]/10 backdrop-blur-sm text-[#800020] px-4 py-2 rounded-full mb-6">
                <FaShoppingBag className="text-sm" />
                <span className="text-sm font-semibold">Trusted Baby Shop in Murang'a</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight">
                Jeech's Cute & Affordable
                <span className="text-[#800020] block mt-2">Baby Essentials</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Welcome to Jeech baby shop we are located at mukuyu-murang'a along market road next to Goat market, come Discover premium quality baby products in Murang'a. Safe, comfortable, 
                and adorable items for your little ones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/shop" className="bg-[#800020] text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all inline-flex items-center gap-2">
                  Shop Now 
                  <FaArrowRight />
                </Link>
                <a href="https://wa.me/254705797336" className="border-2 border-[#800020] text-[#800020] px-8 py-3 rounded-full font-semibold hover:bg-[#800020] hover:text-white transition-all inline-flex items-center gap-2">
                  <FaWhatsapp /> WhatsApp Us
                </a>
              </div>
              
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start mt-8 pt-4">
                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full">
                  <FaClock className="text-green-500" />
                  <span className="text-sm text-gray-600">Fast Response</span>
                </div>
                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full">
                  <FaLeaf className="text-green-500" />
                  <span className="text-sm text-gray-600">Quality Products</span>
                </div>
                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full">
                  <FaStar className="text-yellow-500" />
                  <span className="text-sm text-gray-600">Trusted Shop</span>
                </div>
              </div>
            </motion.div>
            
            {/* Right Side - Image Slider */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {sliderImages.length > 0 ? (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/30 backdrop-blur-sm">
                  <div className="relative aspect-square md:aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {!loadedImages[currentSlide] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BabyLoadingFace />
                      </div>
                    )}
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentSlide}
                        src={sliderImages[currentSlide]?.url}
                        alt={sliderImages[currentSlide]?.name}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${
                          loadedImages[currentSlide] ? 'opacity-100' : 'opacity-0'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: loadedImages[currentSlide] ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        onLoad={() => handleImageLoad(currentSlide)}
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                  </div>
                  
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-lg z-10"
                  >
                    <FaChevronLeft className="text-gray-800" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-lg z-10"
                  >
                    <FaChevronRight className="text-gray-800" />
                  </button>
                  
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {sliderImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          currentSlide === idx ? 'bg-white w-6' : 'bg-white/50 w-1.5'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-gray-100 to-gray-200 aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <FaShoppingBag className="text-5xl text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Product images will appear here</p>
                  </div>
                </div>
              )}
              
              <div className="absolute -bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-[#800020]">{allProducts.length}</p>
                  <p className="text-xs text-gray-500">Products</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-[#800020]">100%</p>
                  <p className="text-xs text-gray-500">Happy Parents</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-[#800020]">24/7</p>
                  <p className="text-xs text-gray-500">Support</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW SECTION - 8 images before clicking through */}
      <section className="container mx-auto px-4 py-20 bg-white/30 backdrop-blur-sm rounded-3xl my-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaImages className="text-3xl text-[#800020]" />
            <span className="text-[#800020] font-semibold uppercase tracking-wide">From Our Gallery</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2 mb-4">Product Previews</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Take a sneak peek at some of our adorable baby products
          </p>
        </motion.div>

        {galleryLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-5xl"
              >
                👶
              </motion.div>
              <p className="text-gray-400 mt-2">Loading gallery...</p>
            </div>
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No images in gallery yet. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryImages.map((image, idx) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative cursor-pointer rounded-xl overflow-hidden shadow-lg group"
                  onClick={() => window.location.href = '/gallery'}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {!loadedGalleryImages[image.id] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BabyLoadingFace />
                      </div>
                    )}
                    <img
                      src={image.thumbnail}
                      alt={image.name}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        loadedGalleryImages[image.id] ? 'opacity-100' : 'opacity-0'
                      } group-hover:scale-110`}
                      onLoad={() => handleGalleryImageLoad(image.id)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs truncate">{image.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link 
                to="/gallery" 
                className="inline-flex items-center gap-2 bg-[#800020]/20 text-[#800020] px-6 py-3 rounded-xl font-semibold hover:bg-[#800020] hover:text-white transition-all"
              >
                <FaImages /> View Full Gallery ({galleryImages.length}+ images)
                <FaArrowRight />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* PRODUCT PREVIEW SECTION */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[#800020] font-semibold uppercase tracking-wide">Shop Our Collection</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2 mb-4">Trending Baby Products</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our most popular items loved by parents across Murang'a
          </p>
        </motion.div>

        {loading ? (
          <Loader />
        ) : !hasProducts ? (
          <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl">
            <p className="text-gray-500 text-lg">No products yet. Add your first product in the admin panel!</p>
            <Link to="/admin/products" className="text-[#800020] mt-4 inline-block font-semibold">
              Add Product →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {previewProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-2 bg-[#800020] text-white px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all hover:scale-105 shadow-lg"
              >
                View All Products ({allProducts.length}) 
                <FaArrowRight />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-20 bg-white/30 backdrop-blur-sm rounded-3xl">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[#800020] font-semibold uppercase tracking-wide">Categories</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2 mb-4">Shop by Category</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find exactly what you need for your little one
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const count = categoryCounts[category.categoryKey] || 0;
            return (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/shop?category=${category.categoryKey}`}>
                  <div className={`${category.bgColor} rounded-2xl p-6 text-center cursor-pointer transition-all hover:shadow-xl hover:scale-105`}>
                    <div className="text-5xl mb-3">{category.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{category.displayName}</h3>
                    <p className="text-sm text-gray-600">{count} products</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50/30 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 text-lg">We're committed to providing the best for your baby</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`${benefit.color} bg-white/60 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <span className="text-[#800020] font-semibold uppercase tracking-wide">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2">What Parents Say ❤️</h2>
            <p className="text-gray-600 mt-2">Join thousands of happy parents</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">"{testimonial.review}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/50">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#800020] to-[#800020] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">Happy Parent</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <FaWhatsapp size={48} className="mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Order? 🎉</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Contact us on WhatsApp for quick ordering and delivery. We're here to help!
            </p>
            <a
              href="https://wa.me/254705797336"
              className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105"
            >
              <FaWhatsapp size={24} /> Order on WhatsApp Now
            </a>
            <p className="text-sm mt-4 opacity-80">⏱️ Response within 30 minutes</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaArrowLeft, FaStar } from 'react-icons/fa';
import Loader from '../components/UI/Loader';
import { getProductById } from '../services/firestore';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const data = await getProductById(id);
      if (!data) {
        toast.error('Product not found');
        navigate('/shop');
        return;
      }
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id, navigate]);

  const handleWhatsAppOrder = () => {
    const message = `Hello Jeech Baby Shop,%0AI want to order:%0AProduct: ${product.name}%0APrice: KES ${product.price.toLocaleString()}%0ACategory: ${product.category}`;
    const whatsappUrl = `https://wa.me/254705797336?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) return <Loader />;
  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
      >
        <FaArrowLeft /> Back to Shop
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="bg-gray-100 rounded-2xl overflow-hidden mb-4">
            <img
              src={product.images?.[selectedImage] || 'https://via.placeholder.com/500'}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`rounded-lg overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="mb-4">
            <span className="inline-block bg-pink-100 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-3">
              {product.category}
            </span>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-4">
              KES {product.price.toLocaleString()}
            </p>
            {product.featured && (
              <div className="flex items-center gap-2 text-yellow-500 mb-4">
                <FaStar /> Featured Product
              </div>
            )}
          </div>

          <div className="border-t border-b py-6 my-6">
            <h3 className="text-xl font-semibold mb-3">Product Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-3"
            >
              <FaWhatsapp size={24} /> Order on WhatsApp Now
            </button>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 text-center">
                
                💳 Cash on delivery available<br/>
                ✅ Quality guaranteed
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;
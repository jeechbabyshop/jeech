import React, { useState } from 'react';
import { FaTimes, FaUpload, FaCamera } from 'react-icons/fa';
import ImageCapture from './ImageCapture';
import ImageEditor from './ImageEditor';
import toast from 'react-hot-toast';

const ProductForm = ({ product, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    category: product?.category || 'clothes',
    description: product?.description || '',
    featured: product?.featured || false,
  });
  
  const [images, setImages] = useState(() => {
    if (product?.images && product.images.length > 0) {
      return product.images.map((url, index) => ({
        url: url,
        isExisting: true,
        id: `existing-${index}`
      }));
    }
    return [];
  });
  
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showEditor, setShowEditor] = useState(null); // For gallery images

  const categories = [
    { value: 'clothes', label: 'Baby Clothes' },
    { value: 'shoes', label: 'Baby Shoes' },
    { value: 'blankets', label: 'Blankets' },
    { value: 'toys', label: 'Toys' },
    { value: 'accessories', label: 'Accessories' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gallery upload - opens ImageEditor (NO camera)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setShowEditor({
          imageData: event.target.result,
          file: file
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Camera - opens ImageCapture
  const handleCameraOpen = () => {
    setShowCamera(true);
  };

  const handleEditorSave = (editedFile) => {
    const newImage = {
      file: editedFile,
      preview: URL.createObjectURL(editedFile),
      isExisting: false,
      id: Math.random().toString(36).substring(7)
    };
    setImages(prev => [...prev, newImage]);
    toast.success('Image added!');
    setShowEditor(null);
  };

  const handleCameraCapture = (capturedImage) => {
    const newImage = {
      file: capturedImage,
      preview: URL.createObjectURL(capturedImage),
      isExisting: false,
      id: Math.random().toString(36).substring(7)
    };
    setImages(prev => [...prev, newImage]);
    toast.success('Photo captured and added!');
    setShowCamera(false);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!product && images.length === 0) {
      toast.error('Please upload at least one product image or take a photo');
      return;
    }

    setLoading(true);
    try {
      const existingImageUrls = images
        .filter(img => img.isExisting)
        .map(img => img.url || img.preview);
      
      const newImageFiles = images
        .filter(img => !img.isExisting && img.file)
        .map(img => img.file);
      
      const productData = {
        ...formData,
        images: existingImageUrls
      };
      
      await onSubmit(productData, newImageFiles);
      toast.success(product ? 'Product updated!' : 'Product created!');
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Price (KES) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 text-primary focus:ring-primary rounded"
              />
              <label className="ml-2 text-sm font-semibold">Featured Product</label>
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">Product Images * (Max 5)</label>
              
              <div className="flex gap-3 mb-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-3 text-center hover:border-primary transition">
                    <FaUpload className="mx-auto text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Upload from Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </label>
                
                <button
                  type="button"
                  onClick={handleCameraOpen}
                  className="flex-1 border-2 border-dashed rounded-lg p-3 text-center hover:border-primary transition"
                >
                  <FaCamera className="mx-auto text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Take Photo with Camera</span>
                </button>
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4 max-h-64 overflow-y-auto p-2">
                  {images.map((img, idx) => (
                    <div key={img.id || idx} className="relative group">
                      <img
                        src={img.preview || img.url}
                        alt={`Preview ${idx}`}
                        className="w-full h-24 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <FaTimes size={12} />
                      </button>
                      {img.isExisting && (
                        <span className="absolute bottom-1 left-1 bg-primary/80 text-white text-[10px] px-1 rounded">
                          Existing
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-400 mt-2">
                {images.length}/5 images selected
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <ImageCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Image Editor for Gallery Images - NO CAMERA */}
      {showEditor && (
        <ImageEditor
          initialImage={showEditor.imageData}
          onSave={handleEditorSave}
          onClose={() => setShowEditor(null)}
        />
      )}
    </>
  );
};

export default ProductForm;
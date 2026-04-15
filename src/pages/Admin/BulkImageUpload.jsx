import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaTrash, FaImages, FaCheck, FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import { supabase, PRODUCTS_BUCKET } from '../../services/supabase';
import toast from 'react-hot-toast';

const BulkImageUpload = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: (file.size / 1024).toFixed(2),
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const uploadAllImages = async () => {
    if (images.length === 0) {
      toast.error('No images to upload');
      return;
    }

    setUploading(true);
    const urls = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      setUploadProgress(prev => ({ ...prev, [image.id]: 'uploading' }));
      
      try {
        const timestamp = Date.now();
        const uniqueId = Math.random().toString(36).substring(7);
        // Fixed: removed 'bulk/' folder and sanitized filename
        const cleanName = image.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${uniqueId}_${cleanName}`;
        
        const { data, error } = await supabase.storage
          .from(PRODUCTS_BUCKET)
          .upload(fileName, image.file, {
            cacheControl: '31536000',
            upsert: false,
          });
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from(PRODUCTS_BUCKET)
          .getPublicUrl(fileName);
        
        urls.push(publicUrl);
        setUploadProgress(prev => ({ ...prev, [image.id]: 'success' }));
        setUploadedUrls(prev => [...prev, publicUrl]);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(prev => ({ ...prev, [image.id]: 'error' }));
        toast.error(`Failed to upload ${image.name}`);
      }
    }
    
    setUploading(false);
    toast.success(`Successfully uploaded ${urls.length} images!`);
    
    if (urls.length > 0) {
      navigator.clipboard.writeText(urls.join('\n'));
      toast.success('All image URLs copied to clipboard!');
    }
  };

  const copyUrlsToClipboard = () => {
    if (uploadedUrls.length === 0) return;
    navigator.clipboard.writeText(uploadedUrls.join('\n'));
    toast.success('URLs copied to clipboard!');
  };

  const clearAll = () => {
    setImages([]);
    setUploadedUrls([]);
    setUploadProgress({});
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <FaCloudUploadAlt className="text-3xl text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bulk Image Upload</h2>
          <p className="text-gray-500 text-sm">Upload multiple images at once - no product details needed</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-pink-300 rounded-2xl p-8 text-center hover:border-primary transition-colors">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
          id="bulk-image-upload"
          disabled={uploading}
        />
        <label
          htmlFor="bulk-image-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <FaUpload className="text-5xl text-gray-400" />
          <div>
            <p className="text-lg font-semibold text-gray-700">Click or drag to upload</p>
            <p className="text-sm text-gray-500">Supports JPG, PNG, GIF (Max 5MB each)</p>
          </div>
        </label>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">
              Selected Images ({images.length})
            </h3>
            <div className="flex gap-2">
              {uploadedUrls.length > 0 && (
                <button
                  onClick={copyUrlsToClipboard}
                  className="text-sm bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition"
                >
                  Copy URLs
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-sm text-red-500 hover:text-red-600 transition"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group"
              >
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  disabled={uploading}
                >
                  <FaTrash size={12} />
                </button>
                {uploadProgress[image.id] === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {uploadProgress[image.id] === 'success' && (
                  <div className="absolute top-1 left-1 bg-green-500 text-white p-1 rounded-full">
                    <FaCheck size={12} />
                  </div>
                )}
                {uploadProgress[image.id] === 'error' && (
                  <div className="absolute inset-0 bg-red-500/50 rounded-lg flex items-center justify-center">
                    <FaTimes className="text-white" />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {images.length > 0 && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={uploadAllImages}
            disabled={uploading}
            className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <FaCloudUploadAlt /> Upload All ({images.length}) Images
              </>
            )}
          </button>
        </div>
      )}

      {/* Uploaded URLs Section */}
      {uploadedUrls.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FaImages /> Uploaded Images ({uploadedUrls.length})
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(uploadedUrls.join('\n'));
                toast.success('URLs copied!');
              }}
              className="text-sm text-primary hover:underline"
            >
              Copy All URLs
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="text-xs text-gray-600 mb-1 font-mono break-all">
                {index + 1}. {url}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImageUpload;
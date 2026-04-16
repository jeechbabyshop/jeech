import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaMagic, FaDownload, FaSpinner, FaPalette, FaUndo, FaCheck } from 'react-icons/fa';

const BackgroundRemover = ({ imageSrc, onSave, onClose }) => {
  const [processedImage, setProcessedImage] = useState(null);
  const [subjectOnly, setSubjectOnly] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showColors, setShowColors] = useState(false);
  const canvasRef = useRef(null);

  const commonColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Pink', value: '#FF69B4' },
    { name: 'Purple', value: '#9B59B6' },
    { name: 'Blue', value: '#3498db' },
    { name: 'Green', value: '#2ecc71' },
    { name: 'Yellow', value: '#f1c40f' },
    { name: 'Orange', value: '#e67e22' },
    { name: 'Red', value: '#e74c3c' },
    { name: 'Teal', value: '#1abc9c' },
    { name: 'Gray', value: '#95a5a6' },
    { name: 'Navy', value: '#2c3e50' },
  ];

  const removeBackground = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image_file', blob, 'image.png');
      formData.append('size', 'auto');
      
      const apiResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'yuBpBUpEZ4xAuS9oLtXA6Jq5',
        },
        body: formData,
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`);
      }
      
      const resultBlob = await apiResponse.blob();
      const imageUrl = URL.createObjectURL(resultBlob);
      
      setSubjectOnly(imageUrl);
      setProcessedImage(imageUrl);
      
    } catch (err) {
      console.error('Background removal failed:', err);
      setError(err.message || 'Failed to remove background. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyColorBackground = async (color) => {
    if (!subjectOnly) return;
    
    setIsProcessing(true);
    try {
      // Load the subject image (transparent background)
      const subjectImg = new Image();
      subjectImg.src = subjectOnly;
      
      await new Promise((resolve) => {
        subjectImg.onload = resolve;
      });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = subjectImg.width;
      canvas.height = subjectImg.height;
      const ctx = canvas.getContext('2d');
      
      // Draw colored background
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw subject on top
      ctx.drawImage(subjectImg, 0, 0);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setProcessedImage(imageUrl);
      }, 'image/png');
      
      setBgColor(color);
      setShowColors(false);
    } catch (err) {
      console.error('Failed to apply background:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToTransparent = () => {
    setProcessedImage(subjectOnly);
    setBgColor('#ffffff');
  };

  const handleSave = async () => {
    if (processedImage) {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const file = new File([blob], 'edited-image.png', { type: 'image/png' });
      onSave(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-20 pb-2 flex items-center justify-between border-b border-gray-200">
        <button onClick={onClose} className="text-gray-600 text-sm font-medium px-3 py-1.5">Cancel</button>
        <h3 className="font-semibold text-gray-800">Background Remover</h3>
        <div className="w-16" />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-900 overflow-auto">
        {!subjectOnly ? (
          <>
            <img src={imageSrc} alt="Original" className="max-h-[50vh] object-contain rounded-lg mb-4" />
            {error && <p className="text-red-400 text-sm mb-2 text-center px-4">{error}</p>}
            <button
              onClick={removeBackground}
              disabled={isProcessing}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
            >
              {isProcessing ? <FaSpinner className="animate-spin" /> : <FaMagic />}
              {isProcessing ? 'Processing...' : 'Remove Background'}
            </button>
          </>
        ) : (
          <>
            {/* Image Preview */}
            <img src={processedImage} alt="Edited" className="max-h-[45vh] object-contain rounded-lg mb-4 shadow-2xl" />
            
            {/* Color Selection Buttons */}
            <div className="flex gap-2 mb-4 flex-wrap justify-center">
              <button
                onClick={() => setShowColors(!showColors)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <FaPalette /> Change Background Color
              </button>
              <button
                onClick={resetToTransparent}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <FaUndo /> Transparent
              </button>
            </div>
            
            {/* Color Picker Grid */}
            {showColors && (
              <div className="bg-white rounded-xl p-4 mb-4 max-w-md">
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {commonColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => applyColorBackground(color.value)}
                      className="w-10 h-10 rounded-lg shadow-md transition-transform hover:scale-110"
                      style={{ backgroundColor: color.value, border: color.value === '#ffffff' ? '1px solid #ddd' : 'none' }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <span className="text-sm text-gray-600">Custom:</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => applyColorBackground(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-2 border-gray-300"
                  />
                  <span className="text-xs text-gray-500 ml-2">Pick any color</span>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={removeBackground}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <FaMagic /> Retry
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
              >
                <FaDownload /> Use This Image
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BackgroundRemover;
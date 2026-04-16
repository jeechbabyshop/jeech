import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { 
  FaCamera, 
  FaTimes, 
  FaRedo, 
  FaUpload, 
  FaCrop, 
  FaCheckCircle,
  FaArrowLeft 
} from 'react-icons/fa';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCapture = ({ onCapture, onClose }) => {
  const [showCamera, setShowCamera] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const webcamRef = useRef(null);
  const imgRef = useRef(null);

  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1920 },
    facingMode: "environment",
    aspectRatio: 1
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowCamera(false);
  };

  const retake = () => {
    setCapturedImage(null);
    setShowCamera(true);
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    });
    setCompletedCrop(null);
  };

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return null;
    
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleUsePhoto = async () => {
    setIsProcessing(true);
    try {
      if (completedCrop) {
        const croppedImage = await getCroppedImg();
        if (croppedImage) {
          onCapture(croppedImage);
        }
      } else {
        // Use full image if no crop selected
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      }
      onClose();
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <FaTimes className="text-xl" />
          </button>
          <div className="flex items-center gap-2">
            {!showCamera && (
              <FaCrop className="text-blue-600 text-lg" />
            )}
            <h3 className="text-gray-800 font-semibold text-lg">
              {showCamera ? 'Capture Photograph' : 'Adjust Crop Area'}
            </h3>
          </div>
          <div className="w-8" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center w-full px-4 py-20">
        <div className="max-w-2xl w-full">
          {showCamera ? (
            // Camera View - Enterprise Style
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="relative bg-gray-900">
                <div className="relative aspect-square">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="absolute inset-0 w-full h-full object-contain"
                    mirrored={false}
                  />
                  {/* Professional guide overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-white opacity-60" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full whitespace-nowrap">
                      Center subject in square
                    </div>
                  </div>
                </div>
                
                {/* Capture Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <div className="flex justify-center">
                    <button
                      onClick={capture}
                      className="bg-white hover:bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-inner" />
                    </button>
                  </div>
                  <p className="text-center text-white text-sm mt-4 opacity-80">
                    Tap to capture photograph
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Camera Ready</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCamera className="text-gray-400" />
                    <span>Square format 1:1</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Crop View - Professional Style
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCrop className="text-blue-600" />
                    <span className="text-gray-700 font-medium">Image Cropping</span>
                  </div>
                  <button
                    onClick={retake}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaRedo className="text-sm" />
                    <span>Retake Photo</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Drag the crop handles to adjust the image area
                  </p>
                </div>
                
                <div className="flex justify-center mb-6">
                  <ReactCrop
                    crop={crop}
                    onChange={setCrop}
                    onComplete={setCompletedCrop}
                    aspect={1}
                    circularCrop={false}
                    className="max-h-[50vh] rounded-lg shadow-lg"
                  >
                    <img
                      ref={imgRef}
                      src={capturedImage}
                      alt="Crop preview"
                      className="max-w-full rounded-lg"
                    />
                  </ReactCrop>
                </div>
                
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={retake}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    <FaArrowLeft className="text-sm" />
                    Retake
                  </button>
                  <button
                    onClick={handleUsePhoto}
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="text-sm" />
                        Apply & Continue
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-xs text-gray-500 text-center">
            Ensure good lighting and keep the subject centered for best results
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageCapture;
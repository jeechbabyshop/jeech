import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { FaCamera, FaTimes, FaRedo, FaUpload } from 'react-icons/fa';
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
      }, 'image/jpeg', 0.9);
    });
  };

  const handleUsePhoto = async () => {
    if (completedCrop) {
      const croppedImage = await getCroppedImg();
      if (croppedImage) {
        onCapture(croppedImage);
      }
    } else {
      // Use full image if no crop selected
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
        });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-black/50">
        <button onClick={onClose} className="text-white text-2xl p-2">
          <FaTimes />
        </button>
        <h3 className="text-white font-semibold">
          {showCamera ? 'Take Photo' : 'Drag corners to crop'}
        </h3>
        <div className="w-8" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center w-full">
        {showCamera ? (
          // Camera View
          <div className="relative w-full max-w-md mx-auto">
            <div className="relative aspect-square bg-black">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="absolute inset-0 w-full h-full object-cover"
                mirrored={false}
              />
              {/* Square guide overlay */}
              <div className="absolute inset-0 border-4 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none mx-auto my-auto w-full h-full" />
            </div>
            
            {/* Capture Button */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button
                onClick={capture}
                className="bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-pink-500 active:scale-95 transition"
              >
                <div className="w-16 h-16 rounded-full bg-pink-500" />
              </button>
            </div>
          </div>
        ) : (
          // Manual Crop View - User can drag/resize
          <div className="w-full max-w-md mx-auto p-4">
            <div className="bg-white rounded-2xl p-4">
              <p className="text-gray-600 text-sm text-center mb-4">
                👆 Drag the corners to crop your image
              </p>
              <ReactCrop
                crop={crop}
                onChange={setCrop}
                onComplete={setCompletedCrop}
                aspect={1}
                circularCrop={false}
                className="max-h-[60vh] overflow-auto"
              >
                <img
                  ref={imgRef}
                  src={capturedImage}
                  alt="Drag to crop"
                  className="max-w-full rounded-lg"
                />
              </ReactCrop>
              
              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={retake}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-full flex items-center gap-2 font-semibold"
                >
                  <FaRedo /> Retake
                </button>
                <button
                  onClick={handleUsePhoto}
                  className="bg-green-500 text-white px-6 py-3 rounded-full flex items-center gap-2 font-semibold"
                >
                  <FaUpload /> Use This Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCapture;
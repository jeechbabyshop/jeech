import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { 
  FaTimes, 
  FaRedo, 
  FaCrop, 
  FaCheckCircle,
  FaArrowLeft,
  FaSlidersH,
  FaCheck,
  FaChevronUp
} from 'react-icons/fa';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCapture = ({ onCapture, onClose }) => {
  const [showCamera, setShowCamera] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [crop, setCrop] = useState({
    unit: 'px',
    width: 800,
    height: 800,
    x: 100,
    y: 100
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const webcamRef = useRef(null);
  const imgRef = useRef(null);

  const aspectRatios = {
    '1:1': { ratio: 1, label: '1:1', icon: '□' },
    '3:4': { ratio: 3/4, label: '3:4', icon: '▯' },
    '9:16': { ratio: 9/16, label: '9:16', icon: '▮' },
    'full': { ratio: null, label: 'Full', icon: '⊞' }
  };

  const getAspectRatioValue = () => {
    switch(selectedRatio) {
      case '1:1': return 1;
      case '3:4': return 3/4;
      case '9:16': return 9/16;
      case 'full': return null;
      default: return 1;
    }
  };

  const getGuideDimensions = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    switch(selectedRatio) {
      case '1:1':
        const squareSize = Math.min(screenWidth, screenHeight) * 0.7;
        return { width: squareSize, height: squareSize };
      case '3:4':
        const portraitHeight = screenHeight * 0.7;
        return { width: portraitHeight * (3/4), height: portraitHeight };
      case '9:16':
        const storyHeight = screenHeight * 0.8;
        return { width: storyHeight * (9/16), height: storyHeight };
      case 'full':
        return { width: screenWidth, height: screenHeight };
      default:
        return { width: 300, height: 300 };
    }
  };

  const videoConstraints = {
    width: { ideal: 4096 },
    height: { ideal: 4096 },
    facingMode: "environment"
  };

  useEffect(() => {
    if (capturedImage && imgRef.current) {
      const img = imgRef.current;
      const updateDimensions = () => {
        const targetRatio = getAspectRatioValue();
        if (targetRatio) {
          let cropWidth, cropHeight;
          if (targetRatio > 1) {
            cropHeight = img.naturalHeight;
            cropWidth = cropHeight * targetRatio;
          } else {
            cropWidth = img.naturalWidth;
            cropHeight = cropWidth / targetRatio;
          }
          
          if (cropWidth > img.naturalWidth) {
            cropWidth = img.naturalWidth;
            cropHeight = cropWidth / targetRatio;
          }
          if (cropHeight > img.naturalHeight) {
            cropHeight = img.naturalHeight;
            cropWidth = cropHeight * targetRatio;
          }
          
          const cropX = (img.naturalWidth - cropWidth) / 2;
          const cropY = (img.naturalHeight - cropHeight) / 2;
          
          setCrop({
            unit: 'px',
            width: cropWidth,
            height: cropHeight,
            x: cropX,
            y: cropY
          });
        }
      };
      if (img.complete) {
        updateDimensions();
      } else {
        img.onload = updateDimensions;
      }
    }
  }, [capturedImage, selectedRatio]);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowCamera(false);
  };

  const retake = () => {
    setCapturedImage(null);
    setShowCamera(true);
    setCompletedCrop(null);
  };

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return null;
    
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const targetRatio = getAspectRatioValue();
    
    let finalWidth = completedCrop.width;
    let finalHeight = completedCrop.height;
    
    if (targetRatio && selectedRatio !== 'full') {
      if (targetRatio > 1) {
        finalHeight = completedCrop.width / targetRatio;
      } else {
        finalWidth = completedCrop.height * targetRatio;
      }
    }
    
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      completedCrop.x,
      completedCrop.y,
      completedCrop.width,
      completedCrop.height,
      0,
      0,
      finalWidth,
      finalHeight
    );
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], `photo-${selectedRatio}-${Date.now()}.jpg`, { type: 'image/jpeg' });
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
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], `photo-${selectedRatio}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      }
      onClose();
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const guideDimensions = getGuideDimensions();

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {showCamera ? (
        // CAMERA VIEW
        <div className="relative flex-1 w-full h-full bg-black">
          {/* Camera Preview */}
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="absolute inset-0 w-full h-full object-cover"
            mirrored={false}
          />
          
          {/* Guide Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {selectedRatio !== 'full' && (
              <>
                {/* Dark overlay outside guide */}
                <div className="absolute inset-0 bg-black bg-opacity-50" />
                
                {/* Clear area (using mask) */}
                <div 
                  className="absolute bg-transparent"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: guideDimensions.width,
                    height: guideDimensions.height,
                    backgroundColor: 'transparent',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                  }}
                />
                
                {/* Guide Border */}
                <div 
                  className="absolute border-2 border-white"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: guideDimensions.width,
                    height: guideDimensions.height,
                  }}
                >
                  {/* Corner markers */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-white" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-white" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-white" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-white" />
                </div>
              </>
            )}
          </div>
          
          {/* Top Bar - Only Close Button */}
          <div className="absolute top-0 left-0 right-0 px-4 py-3">
            <button 
              onClick={onClose} 
              className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70 transition-all"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          {/* Bottom Controls - Ratio Selector + Capture Button Side by Side */}
          <div className="absolute bottom-8 left-0 right-0 px-6">
            <div className="flex items-center justify-center gap-6">
              {/* Ratio Selector Button */}
              <div className="relative">
                <button
                  onClick={() => setShowRatioMenu(!showRatioMenu)}
                  className="bg-black/60 backdrop-blur-md text-white px-5 py-3 rounded-full flex items-center gap-2 hover:bg-black/80 transition-all border border-white/20"
                >
                  <span className="text-xl">{aspectRatios[selectedRatio].icon}</span>
                  <span className="font-semibold text-base">{aspectRatios[selectedRatio].label}</span>
                  <FaChevronUp className={`text-sm transition-transform ${showRatioMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu - Opens UPWARD */}
                {showRatioMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowRatioMenu(false)}
                    />
                    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl overflow-hidden min-w-[140px] z-20">
                      {Object.entries(aspectRatios).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedRatio(key);
                            setShowRatioMenu(false);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors ${
                            selectedRatio === key ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{value.icon}</span>
                            <span className="font-medium">{value.label}</span>
                          </div>
                          {selectedRatio === key && <FaCheck className="text-blue-600 text-sm" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Capture Button */}
              <button
                onClick={capture}
                className="bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
              </button>
              
              {/* Spacer for balance */}
              <div className="w-[88px]" />
            </div>
            
            {/* Instruction Text */}
            <p className="text-center text-white text-xs mt-4 bg-black/40 backdrop-blur-sm inline-block mx-auto px-3 py-1 rounded-full w-auto block">
              {selectedRatio === 'full' ? 'Full screen capture' : `${aspectRatios[selectedRatio].label} format`}
            </p>
          </div>
        </div>
      ) : (
        // CROP VIEW
        <div className="flex-1 flex flex-col bg-black">
          {/* Crop Header */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
            <button
              onClick={retake}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
            >
              <FaArrowLeft className="text-lg" />
              <span>Retake</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              <FaCrop className="text-lg" />
              <span className="text-sm font-medium">Crop to {aspectRatios[selectedRatio].label}</span>
            </div>
            <div className="w-16" />
          </div>
          
          {/* Crop Area */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={setCompletedCrop}
              aspect={getAspectRatioValue()}
              className="max-h-full"
            >
              <img
                ref={imgRef}
                src={capturedImage}
                alt="Crop preview"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </ReactCrop>
          </div>
          
          {/* Action Buttons */}
          <div className="bg-white border-t border-gray-200 px-4 py-4">
            <div className="flex gap-3">
              <button
                onClick={retake}
                disabled={isProcessing}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium text-base"
              >
                Retake
              </button>
              <button
                onClick={handleUsePhoto}
                disabled={isProcessing}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium text-base shadow-md disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Use Photo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCapture;
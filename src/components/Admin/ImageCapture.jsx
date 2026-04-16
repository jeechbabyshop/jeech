import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { 
  FaTimes, 
  FaRedo, 
  FaCrop, 
  FaCheckCircle,
  FaArrowLeft,
  FaChevronUp,
  FaCheck,
  FaMagic,
  FaSun,
  FaAdjust,
  FaUndo,
  FaPalette,
  FaTint,
  FaEye,
  FaChevronDown
} from 'react-icons/fa';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCapture = ({ onCapture, onClose }) => {
  const [showCamera, setShowCamera] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('crop');
  const [showEnhancePanel, setShowEnhancePanel] = useState(true);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancements, setEnhancements] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
    sharpness: 0
  });
  const [previewImage, setPreviewImage] = useState(null);
  const webcamRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

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
    if (capturedImage && activeTab === 'enhance') {
      updatePreview();
    }
  }, [enhancements, capturedImage, activeTab]);

  const updatePreview = async () => {
    if (!capturedImage) return;
    const enhancedImage = await applyEnhancementsToImage(capturedImage);
    setPreviewImage(enhancedImage);
  };

  const applyEnhancementsToImage = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        const brightnessFilter = `brightness(${enhancements.brightness}%)`;
        const contrastFilter = `contrast(${enhancements.contrast}%)`;
        const saturateFilter = `saturate(${enhancements.saturation}%)`;
        
        ctx.filter = `${brightnessFilter} ${contrastFilter} ${saturateFilter}`;
        ctx.drawImage(img, 0, 0);
        
        if (enhancements.warmth !== 0) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const warmth = enhancements.warmth / 100;
          
          for (let i = 0; i < data.length; i += 4) {
            data[i] += warmth * 30;
            data[i+1] += warmth * 10;
          }
          ctx.putImageData(imageData, 0, 0);
        }
        
        if (enhancements.sharpness > 0) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const sharpness = enhancements.sharpness / 100;
          
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] + (data[i] * sharpness));
            data[i+1] = Math.min(255, data[i+1] + (data[i+1] * sharpness));
            data[i+2] = Math.min(255, data[i+2] + (data[i+2] * sharpness));
          }
          ctx.putImageData(imageData, 0, 0);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = imageSrc;
    });
  };

  useEffect(() => {
    if (capturedImage && imgRef.current) {
      setCrop({
        unit: '%',
        width: 80,
        height: 80,
        x: 10,
        y: 10
      });
    }
  }, [selectedRatio, capturedImage]);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setPreviewImage(imageSrc);
    setShowCamera(false);
    setActiveTab('crop');
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    });
    setEnhancements({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      sharpness: 0
    });
  };

  const retake = () => {
    setCapturedImage(null);
    setPreviewImage(null);
    setShowCamera(true);
    setCompletedCrop(null);
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    });
    setEnhancements({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      sharpness: 0
    });
  };

  const applyEnhancements = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        const brightnessFilter = `brightness(${enhancements.brightness}%)`;
        const contrastFilter = `contrast(${enhancements.contrast}%)`;
        const saturateFilter = `saturate(${enhancements.saturation}%)`;
        
        ctx.filter = `${brightnessFilter} ${contrastFilter} ${saturateFilter}`;
        ctx.drawImage(img, 0, 0);
        
        if (enhancements.warmth !== 0) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const warmth = enhancements.warmth / 100;
          
          for (let i = 0; i < data.length; i += 4) {
            data[i] += warmth * 30;
            data[i+1] += warmth * 10;
          }
          ctx.putImageData(imageData, 0, 0);
        }
        
        if (enhancements.sharpness > 0) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const sharpness = enhancements.sharpness / 100;
          
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] + (data[i] * sharpness));
            data[i+1] = Math.min(255, data[i+1] + (data[i+1] * sharpness));
            data[i+2] = Math.min(255, data[i+2] + (data[i+2] * sharpness));
          }
          ctx.putImageData(imageData, 0, 0);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = imageSrc;
    });
  };

  const getCroppedImg = async () => {
    if (!completedCrop || !imgRef.current) return null;
    
    let imageSrc = capturedImage;
    
    if (enhancements.brightness !== 100 || enhancements.contrast !== 100 || 
        enhancements.saturation !== 100 || enhancements.warmth !== 0 || enhancements.sharpness !== 0) {
      imageSrc = await applyEnhancements(imageSrc);
    }
    
    const img = new Image();
    img.src = imageSrc;
    await new Promise((resolve) => { img.onload = resolve; });
    
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
    
    const scaleX = img.width / imgRef.current.width;
    const scaleY = img.height / imgRef.current.height;
    
    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
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
      let finalImage = capturedImage;
      
      if (enhancements.brightness !== 100 || enhancements.contrast !== 100 || 
          enhancements.saturation !== 100 || enhancements.warmth !== 0 || enhancements.sharpness !== 0) {
        finalImage = await applyEnhancements(finalImage);
      }
      
      if (completedCrop) {
        const croppedImage = await getCroppedImg();
        if (croppedImage) {
          onCapture(croppedImage);
        }
      } else {
        const response = await fetch(finalImage);
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

  const resetEnhancements = () => {
    setEnhancements({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      sharpness: 0
    });
  };

  const guideDimensions = getGuideDimensions();

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {showCamera ? (
        // CAMERA VIEW
        <div className="relative flex-1 w-full h-full bg-black">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="absolute inset-0 w-full h-full object-cover"
            mirrored={false}
          />
          
          <div className="absolute inset-0 pointer-events-none">
            {selectedRatio !== 'full' && (
              <>
                <div 
                  className="absolute bg-transparent"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: guideDimensions.width,
                    height: guideDimensions.height,
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                  }}
                />
                
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
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-white" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-white" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-white" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-white" />
                </div>
              </>
            )}
          </div>
          
          <div className="absolute top-4 left-4 right-4 px-2 py-2">
            <button 
              onClick={onClose} 
              className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70 transition-all"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          <div className="absolute bottom-8 left-0 right-0 px-6 pb-6">
            <div className="flex items-center justify-center gap-6">
              <div className="relative">
                <button
                  onClick={() => setShowRatioMenu(!showRatioMenu)}
                  className="bg-black/60 backdrop-blur-md text-white px-5 py-3 rounded-full flex items-center gap-2 hover:bg-black/80 transition-all border border-white/20"
                >
                  <span className="text-xl">{aspectRatios[selectedRatio].icon}</span>
                  <span className="font-semibold text-base">{aspectRatios[selectedRatio].label}</span>
                  <FaChevronUp className={`text-sm transition-transform ${showRatioMenu ? 'rotate-180' : ''}`} />
                </button>
                
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
              
              <button
                onClick={capture}
                className="bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
              </button>
              
              <div className="w-[88px]" />
            </div>
            
            <p className="text-center text-white text-xs mt-4 bg-black/40 backdrop-blur-sm inline-block mx-auto px-3 py-1 rounded-full w-auto block">
              {selectedRatio === 'full' ? 'Full screen capture' : `${aspectRatios[selectedRatio].label} format`}
            </p>
          </div>
        </div>
      ) : (
        // EDIT VIEW
        <div className="flex-1 flex flex-col bg-black">
          {/* Header */}
          <div className="bg-white px-4 pt-16 pb-2 flex items-center justify-between border-b border-gray-200">
            <button
              onClick={retake}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
            >
              <FaArrowLeft className="text-base" />
              <span className="text-sm">Retake</span>
            </button>
            
            <div className="flex gap-2 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('crop')}
                className={`px-4 py-1.5 rounded-md flex items-center gap-1.5 transition-all duration-200 text-sm ${
                  activeTab === 'crop' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaCrop className="text-sm" />
                <span>Crop</span>
              </button>
              <button
                onClick={() => setActiveTab('enhance')}
                className={`px-4 py-1.5 rounded-md flex items-center gap-1.5 transition-all duration-200 text-sm ${
                  activeTab === 'enhance' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaMagic className="text-sm" />
                <span>Enhance</span>
              </button>
            </div>
            
            <div className="w-16" />
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-gray-900">
            {activeTab === 'crop' ? (
              // CROP MODE - Fully visible with instructions
              <div className="flex flex-col h-full">
                {/* Instructions Banner */}
                <div className="bg-blue-600/30 px-4 py-2.5 text-center border-b border-blue-500/30">
                  <p className="text-blue-200 text-xs flex items-center justify-center gap-2">
                    <FaCrop className="text-xs" />
                    Tap and drag the corner handles to crop your image
                    <FaCrop className="text-xs" />
                  </p>
                </div>
                
                {/* Crop Canvas */}
                <div 
                  ref={containerRef}
                  className="flex-1 flex items-center justify-center p-4 bg-black"
                >
                  <div className="relative max-w-full max-h-full">
                    <ReactCrop
                      crop={crop}
                      onChange={(newCrop) => setCrop(newCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={getAspectRatioValue()}
                      ruleOfThirds
                      className="react-crop-container"
                    >
                      <img
                        ref={imgRef}
                        src={capturedImage}
                        alt="Crop preview"
                        className="max-w-full max-h-[calc(100vh-200px)] object-contain"
                      />
                    </ReactCrop>
                  </div>
                </div>
                
                {/* Ratio Selector */}
                <div className="bg-gray-900 border-t border-gray-800 p-3">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-white text-xs">Aspect Ratio:</span>
                    <div className="flex gap-2">
                      {Object.entries(aspectRatios).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedRatio(key)}
                          className={`px-3 py-1 rounded-lg text-xs transition ${
                            selectedRatio === key 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {value.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // ENHANCE MODE
              <div className="flex flex-col h-full">
                {/* Image Preview */}
                <div className="flex-1 flex items-center justify-center p-3 bg-black/50 min-h-[45vh]">
                  <div className="relative max-w-full">
                    <img
                      src={previewImage || capturedImage}
                      alt="Enhanced preview"
                      className="max-w-full max-h-[45vh] object-contain rounded-lg shadow-2xl"
                    />
                    <div className="absolute top-2 right-2 bg-blue-600/80 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FaEye className="text-[10px]" /> Live
                    </div>
                  </div>
                </div>
                
                {/* Collapsible Controls */}
                <div className="bg-gray-900 border-t border-gray-800 pb-4">
                  <button
                    onClick={() => setShowEnhancePanel(!showEnhancePanel)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-gray-400 text-xs"
                  >
                    <FaChevronDown className={`text-xs transition-transform ${showEnhancePanel ? 'rotate-180' : ''}`} />
                    <span>Adjustments</span>
                  </button>
                  
                  {showEnhancePanel && (
                    <div className="p-3 space-y-3 max-h-[35vh] overflow-y-auto">
                      <div>
                        <div className="flex items-center justify-between text-white text-xs mb-1">
                          <span className="flex items-center gap-1"><FaSun className="text-yellow-400 text-xs" /> Brightness</span>
                          <span className="text-blue-400 font-mono text-xs">{enhancements.brightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={enhancements.brightness}
                          onChange={(e) => setEnhancements(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-white text-xs mb-1">
                          <span className="flex items-center gap-1"><FaAdjust className="text-blue-400 text-xs" /> Contrast</span>
                          <span className="text-blue-400 font-mono text-xs">{enhancements.contrast}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={enhancements.contrast}
                          onChange={(e) => setEnhancements(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-white text-xs mb-1">
                          <span className="flex items-center gap-1"><FaTint className="text-purple-400 text-xs" /> Saturation</span>
                          <span className="text-blue-400 font-mono text-xs">{enhancements.saturation}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={enhancements.saturation}
                          onChange={(e) => setEnhancements(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-white text-xs mb-1">
                          <span className="flex items-center gap-1"><FaPalette className="text-orange-400 text-xs" /> Warmth</span>
                          <span className="text-blue-400 font-mono text-xs">{enhancements.warmth > 0 ? `+${enhancements.warmth}` : enhancements.warmth}</span>
                        </div>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={enhancements.warmth}
                          onChange={(e) => setEnhancements(prev => ({ ...prev, warmth: parseInt(e.target.value) }))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-white text-xs mb-1">
                          <span className="flex items-center gap-1">✨ Sharpness</span>
                          <span className="text-blue-400 font-mono text-xs">{enhancements.sharpness}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={enhancements.sharpness}
                          onChange={(e) => setEnhancements(prev => ({ ...prev, sharpness: parseInt(e.target.value) }))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <button
                        onClick={resetEnhancements}
                        className="w-full py-1.5 bg-gray-700 text-white rounded-lg flex items-center justify-center gap-1 hover:bg-gray-600 transition-all duration-200 text-xs"
                      >
                        <FaUndo className="text-xs" /> Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="bg-white border-t border-gray-200 px-4 pb-16 pt-3">
            <div className="flex gap-3">
              <button
                onClick={retake}
                disabled={isProcessing}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUsePhoto}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm shadow-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="text-sm" /> Apply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .react-crop-container {
          max-width: 100%;
          max-height: calc(100vh - 200px);
        }
        .react-crop-container .ReactCrop__crop-selection {
          border: 2px solid #3b82f6 !important;
        }
        .react-crop-container .ReactCrop__drag-handle {
          background-color: #3b82f6 !important;
          width: 14px !important;
          height: 14px !important;
          border: 2px solid white !important;
        }
        input[type="range"] {
          -webkit-appearance: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        input[type="range"]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default ImageCapture;
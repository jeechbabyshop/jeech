import React, { useState, useRef, useEffect } from 'react';
import { 
  FaTimes, 
  FaCrop, 
  FaCheckCircle,
  FaMagic,
  FaSun,
  FaAdjust,
  FaUndo,
  FaPalette,
  FaTint,
  FaEye,
  FaExpand
} from 'react-icons/fa';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageEditor = ({ initialImage, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState('crop');
  const [cropEnabled, setCropEnabled] = useState(false);
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
  const [previewImage, setPreviewImage] = useState(initialImage);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const imgRef = useRef(null);

  const aspectRatios = {
    '1:1': { ratio: 1, label: '1:1' },
    '3:4': { ratio: 3/4, label: '3:4' },
    '9:16': { ratio: 9/16, label: '9:16' },
    'full': { ratio: null, label: 'Full' }
  };

  const getAspectRatioValue = () => {
    const ratio = aspectRatios[selectedRatio].ratio;
    return ratio;
  };

  useEffect(() => {
    if (activeTab === 'enhance') {
      updatePreview();
    }
  }, [enhancements, activeTab]);

  const updatePreview = async () => {
    const enhancedImage = await applyEnhancementsToImage(initialImage);
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
        
        ctx.filter = `brightness(${enhancements.brightness}%) contrast(${enhancements.contrast}%) saturate(${enhancements.saturation}%)`;
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

  const applyEnhancements = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        ctx.filter = `brightness(${enhancements.brightness}%) contrast(${enhancements.contrast}%) saturate(${enhancements.saturation}%)`;
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
    if (!cropEnabled || !completedCrop || !imgRef.current) return null;
    
    let imageSrc = initialImage;
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
    
    ctx.drawImage(img, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, finalWidth, finalHeight);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      let finalImage = initialImage;
      
      if (enhancements.brightness !== 100 || enhancements.contrast !== 100 || 
          enhancements.saturation !== 100 || enhancements.warmth !== 0 || enhancements.sharpness !== 0) {
        finalImage = await applyEnhancements(finalImage);
      }
      
      if (cropEnabled && completedCrop) {
        const croppedImage = await getCroppedImg();
        if (croppedImage) onSave(croppedImage);
        else {
          const response = await fetch(finalImage);
          const blob = await response.blob();
          onSave(new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' }));
        }
      } else {
        const response = await fetch(finalImage);
        const blob = await response.blob();
        onSave(new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      }
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetEnhancements = () => {
    setEnhancements({ brightness: 100, contrast: 100, saturation: 100, warmth: 0, sharpness: 0 });
  };

  const toggleCrop = () => {
    setCropEnabled(!cropEnabled);
    if (!cropEnabled) {
      setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
      setCompletedCrop(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header - Push down so buttons are visible */}
<div className="bg-white px-4 pt-24 pb-2 flex items-center justify-between border-b border-gray-200">
  <button onClick={onClose} className="text-gray-600 text-sm font-medium px-3 py-1.5">Cancel</button>
  <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
    <button onClick={() => setActiveTab('crop')} className={`px-4 py-1 rounded-md text-sm ${activeTab === 'crop' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Crop</button>
    <button onClick={() => setActiveTab('enhance')} className={`px-4 py-1 rounded-md text-sm ${activeTab === 'enhance' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Enhance</button>
  </div>
  <div className="w-16" />
</div>
      
      {/* Content - Compact, no scroll */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'crop' ? (
          <>
            {/* Crop Toggle - Compact */}
            <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
              <span className="text-white text-xs">Crop Image</span>
              <button onClick={toggleCrop} className={`px-3 py-0.5 rounded-md text-xs font-medium ${cropEnabled ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                {cropEnabled ? '✓ Crop On' : 'Enable Crop'}
              </button>
            </div>
            
            {cropEnabled ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex items-center justify-center p-2 bg-black">
                  <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={getAspectRatioValue()} className="max-h-[50vh]">
                    <img ref={imgRef} src={initialImage} alt="Crop" className="max-h-[45vh] object-contain" />
                  </ReactCrop>
                </div>
                <div className="bg-gray-900 p-2 flex items-center justify-center gap-2 flex-wrap">
                  {Object.entries(aspectRatios).map(([key, val]) => (
                    <button key={key} onClick={() => setSelectedRatio(key)} className={`px-2 py-0.5 rounded text-xs ${selectedRatio === key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{val.label}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 bg-black">
                <div className="text-center">
                  <img src={initialImage} alt="Full" className="max-h-[55vh] object-contain rounded" />
                  <p className="text-gray-500 text-xs mt-2 flex items-center justify-center gap-1"><FaExpand className="text-blue-400 text-xs" /> Enable crop above to trim</p>
                </div>
              </div>
            )}
          </>
        ) : (
          // Enhance Mode - Compact
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-2 bg-black/50">
              <img src={previewImage} alt="Preview" className="max-h-[45vh] object-contain rounded-lg" />
            </div>
            <div className="bg-gray-900 p-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <FaSun className="text-yellow-400 text-xs w-6" />
                <input type="range" min="50" max="150" value={enhancements.brightness} onChange={(e) => setEnhancements({...enhancements, brightness: parseInt(e.target.value)})} className="flex-1 h-1" />
                <span className="text-blue-400 text-xs w-8">{enhancements.brightness}%</span>
              </div>
              <div className="flex items-center gap-2">
                <FaAdjust className="text-blue-400 text-xs w-6" />
                <input type="range" min="50" max="150" value={enhancements.contrast} onChange={(e) => setEnhancements({...enhancements, contrast: parseInt(e.target.value)})} className="flex-1 h-1" />
                <span className="text-blue-400 text-xs w-8">{enhancements.contrast}%</span>
              </div>
              <div className="flex items-center gap-2">
                <FaTint className="text-purple-400 text-xs w-6" />
                <input type="range" min="50" max="150" value={enhancements.saturation} onChange={(e) => setEnhancements({...enhancements, saturation: parseInt(e.target.value)})} className="flex-1 h-1" />
                <span className="text-blue-400 text-xs w-8">{enhancements.saturation}%</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPalette className="text-orange-400 text-xs w-6" />
                <input type="range" min="-50" max="50" value={enhancements.warmth} onChange={(e) => setEnhancements({...enhancements, warmth: parseInt(e.target.value)})} className="flex-1 h-1" />
                <span className="text-blue-400 text-xs w-8">{enhancements.warmth > 0 ? `+${enhancements.warmth}` : enhancements.warmth}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs w-6">✨</span>
                <input type="range" min="0" max="100" value={enhancements.sharpness} onChange={(e) => setEnhancements({...enhancements, sharpness: parseInt(e.target.value)})} className="flex-1 h-1" />
                <span className="text-blue-400 text-xs w-8">{enhancements.sharpness}%</span>
              </div>
              <button onClick={resetEnhancements} className="w-full py-1 bg-gray-700 text-white rounded text-xs flex items-center justify-center gap-1"><FaUndo className="text-xs" /> Reset</button>
            </div>
          </div>
        )}
      </div>
      
      {/* Action Buttons - Compact */}
      <div className="bg-white border-t px-4 pb-6 pt-2">
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">Cancel</button>
          <button onClick={handleSave} disabled={isProcessing} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-1">
            {isProcessing ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FaCheckCircle className="text-sm" /> Apply</>}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        input[type="range"] { -webkit-appearance: none; background: #4b5563; border-radius: 4px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: 1px solid white; }
        .ReactCrop { max-height: 50vh; }
      `}</style>
    </div>
  );
};

export default ImageEditor;
import { db } from './firebase';
import { supabase, PRODUCTS_BUCKET } from './supabase';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, 
  query, where, orderBy, getDoc, Timestamp 
} from 'firebase/firestore';

// Products CRUD Operations
export const getProducts = async () => {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getFeaturedProducts = async () => {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('featured', '==', true), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getProductsByCategory = async (category) => {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('category', '==', category), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getProductById = async (id) => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createProduct = async (productData, images) => {
  // Compress images before upload
  const compressedImages = await Promise.all(
    Array.from(images).map(img => compressImage(img))
  );
  const imageUrls = await uploadImagesToSupabase(compressedImages);
  const product = {
    ...productData,
    images: imageUrls,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'products'), product);
  return { id: docRef.id, ...product };
};

export const updateProduct = async (id, productData, newImages = []) => {
  let imageUrls = productData.images || [];
  if (newImages.length > 0) {
    const compressedImages = await Promise.all(
      Array.from(newImages).map(img => compressImage(img))
    );
    const newImageUrls = await uploadImagesToSupabase(compressedImages);
    imageUrls = [...imageUrls, ...newImageUrls];
  }
  const product = {
    ...productData,
    images: imageUrls,
    updatedAt: Timestamp.now(),
  };
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, product);
  return { id, ...product };
};

export const deleteProduct = async (id, imageUrls) => {
  // Delete images from Supabase Storage
  for (const url of imageUrls) {
    try {
      // Extract file path from Supabase URL
      const fileName = url.split('/storage/v1/object/public/product-images/')[1];
      if (fileName) {
        const { error } = await supabase.storage
          .from(PRODUCTS_BUCKET)
          .remove([fileName]);
        if (error) console.error('Error deleting from Supabase:', error);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
  // Delete product from Firestore
  await deleteDoc(doc(db, 'products', id));
};

// Testimonials Operations
export const getTestimonials = async () => {
  const testimonialsRef = collection(db, 'testimonials');
  const q = query(testimonialsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addTestimonial = async (testimonial) => {
  const testimonialData = {
    ...testimonial,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'testimonials'), testimonialData);
  return { id: docRef.id, ...testimonialData };
};

export const deleteTestimonial = async (id) => {
  await deleteDoc(doc(db, 'testimonials', id));
};

// Messages Operations
export const addMessage = async (message) => {
  const messageData = {
    ...message,
    createdAt: Timestamp.now(),
    read: false,
  };
  const docRef = await addDoc(collection(db, 'messages'), messageData);
  return { id: docRef.id, ...messageData };
};

export const getMessages = async () => {
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Helper: Compress image before upload
const compressImage = (file) => {
  return new Promise((resolve) => {
    // If file is already small, don't compress
    if (file.size < 200 * 1024) { // Less than 200KB
      resolve(file);
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize to max 800px (good for web display)
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with 75% quality
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg',
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.75);
      };
    };
  });
};

// Helper: Upload multiple images to Supabase Storage with better caching
const uploadImagesToSupabase = async (images) => {
  const uploadPromises = Array.from(images).map(async (image, index) => {
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);
    // Remove folder structure for simpler URLs
    const fileName = `${timestamp}_${uniqueId}_${index}.jpg`;
    
    console.log(`Uploading image ${index + 1}/${images.length}: ${fileName}`);
    
    // Upload to Supabase Storage with LONG cache time
    const { data, error } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .upload(fileName, image, {
        cacheControl: '31536000', // 1 YEAR cache!
        upsert: false,
        contentType: 'image/jpeg',
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
    
    // Get public URL from Supabase
    const { data: { publicUrl } } = supabase.storage
      .from(PRODUCTS_BUCKET)
      .getPublicUrl(fileName);
    
    console.log('Uploaded to:', publicUrl);
    return publicUrl;
  });
  
  return Promise.all(uploadPromises);
};
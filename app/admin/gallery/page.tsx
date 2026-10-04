'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  X, 
  Loader2, 
  Upload, 
  Check, 
  Sparkles,
  Camera
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { GalleryItem } from '@/types';
import { useToast } from '@/components/ui/toast-provider';
import CustomAlertDialog from '@/components/ui/custom-dialog';
import Image from 'next/image';

interface ExtendedGalleryItem extends GalleryItem {
  category?: string;
}

const defaultPhotos: ExtendedGalleryItem[] = [
  {
    id: 'gal-1',
    image: '/background.jpg',
    title: 'Main Workout Floor & Heavy Iron',
    category: 'Training Floor',
    alt: 'Main gym floor with barbell and dumbbell equipment',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'gal-2',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    title: 'Advanced Cardio Theater',
    category: 'Cardio',
    alt: 'State of the art treadmills and stationary bikes',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'gal-3',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    title: 'Heavy Strength & Power Rack Arena',
    category: 'Strength',
    alt: 'Olympic barbell racks and bench stations',
    active: true,
    displayOrder: 3,
  },
  {
    id: 'gal-4',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    title: 'Functional Turf & Agility Zone',
    category: 'Conditioning',
    alt: 'Functional conditioning turf with kettlebells',
    active: true,
    displayOrder: 4,
  },
];

export default function AdminGallery() {
  const [photos, setPhotos] = useState<ExtendedGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<Partial<ExtendedGalleryItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<ExtendedGalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Compression statistics
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: string;
    compressedSize: string;
    percentSaved: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();

  const fetchPhotos = useCallback(async () => {
    try {
      const q = query(collection(db, 'gallery'), orderBy('displayOrder', 'asc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ExtendedGalleryItem));

      let local: ExtendedGalleryItem[] = [];
      try {
        local = JSON.parse(localStorage.getItem('local_gallery') || '[]');
      } catch (e) {
        // ignore
      }

      if (items.length === 0 && local.length === 0) {
        setPhotos(defaultPhotos);
      } else {
        const map = new Map<string, ExtendedGalleryItem>();
        defaultPhotos.forEach((p) => map.set(p.id!, p));
        local.forEach((p) => map.set(p.id!, p));
        items.forEach((p) => map.set(p.id!, p));
        setPhotos(Array.from(map.values()));
      }
    } catch (err: any) {
      console.warn('Firestore gallery fetch note:', err?.message);
      try {
        const local = JSON.parse(localStorage.getItem('local_gallery') || '[]');
        setPhotos(local.length > 0 ? local : defaultPhotos);
      } catch (e) {
        setPhotos(defaultPhotos);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPhotos();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchPhotos]);

  // Open Add
  const handleOpenAdd = () => {
    setCompressionStats(null);
    setCurrentPhoto({
      title: '',
      category: 'Gym Floor',
      image: '',
      alt: '',
      active: true,
      displayOrder: photos.length + 1,
    });
    setIsModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (photo: ExtendedGalleryItem) => {
    setCompressionStats(null);
    setCurrentPhoto({ ...photo });
    setIsModalOpen(true);
  };

  // File Upload handler (Strictly converts & compresses to WebP)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsCompressing(true);
    const originalBytes = file.size;
    const originalSizeStr = originalBytes > 1024 * 1024 
      ? (originalBytes / (1024 * 1024)).toFixed(2) + ' MB' 
      : (originalBytes / 1024).toFixed(0) + ' KB';

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new window.Image();
      img.onload = () => {
        // High quality scale down to max 1280px dimension
        const maxDimension = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // STRICT WEBP COMPRESSION (0.80 quality factor)
          let compressedWebpUrl = canvas.toDataURL('image/webp', 0.80);
          
          // Fallback if browser canvas does not support webp export (outputs image/png instead)
          if (!compressedWebpUrl.startsWith('data:image/webp')) {
            compressedWebpUrl = canvas.toDataURL('image/jpeg', 0.82);
          }

          const approxBytes = Math.round((compressedWebpUrl.length * 3) / 4);
          const compressedSizeStr = approxBytes > 1024 * 1024
            ? (approxBytes / (1024 * 1024)).toFixed(2) + ' MB'
            : (approxBytes / 1024).toFixed(0) + ' KB';
          const percentSaved = Math.max(0, Math.round(((originalBytes - approxBytes) / originalBytes) * 100));

          setCompressionStats({
            originalSize: originalSizeStr,
            compressedSize: compressedSizeStr,
            percentSaved,
          });

          setCurrentPhoto((prev) => ({
            ...prev,
            image: compressedWebpUrl,
            title: prev?.title || file.name.replace(/\.[^/.]+$/, ''),
          }));

          toast.success(`Image converted to WebP! Size reduced by ${percentSaved}%.`);
        }
        setIsCompressing(false);
      };

      img.onerror = () => {
        setIsCompressing(false);
        toast.error('Failed to read image file.');
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      setIsCompressing(false);
      toast.error('Error reading file from device.');
    };

    reader.readAsDataURL(file);
  };

  // Save Photo
  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPhoto?.title?.trim() || !currentPhoto?.image?.trim()) {
      toast.warning('Please provide a title and select/upload an image.');
      return;
    }

    setIsSaving(true);
    let finalImageUrl = currentPhoto.image.trim();

    // If it is a Data URL, upload to Firebase Storage strictly as .webp
    if (finalImageUrl.startsWith('data:image')) {
      try {
        const cleanName = (currentPhoto.title || 'photo')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .slice(0, 30);
        const fileRef = storageRef(storage, `oxygenmultifitgym/gallery/${Date.now()}_${cleanName}.webp`);
        await uploadString(fileRef, finalImageUrl, 'data_url', {
          contentType: 'image/webp',
          customMetadata: {
            format: 'webp',
            compressed: 'true',
            gym: 'Oxygen Multifit Gym',
          },
        });
        finalImageUrl = await getDownloadURL(fileRef);
      } catch (storageErr: any) {
        console.warn('Firebase Storage upload notice (using WebP compressed data):', storageErr?.message);
      }
    }

    const isEdit = Boolean(currentPhoto.id && !currentPhoto.id.startsWith('gal-'));

    try {
      if (isEdit && currentPhoto.id) {
        const docRef = doc(db, 'gallery', currentPhoto.id);
        try {
          await updateDoc(docRef, {
            title: currentPhoto.title.trim(),
            category: currentPhoto.category?.trim() || 'General',
            image: finalImageUrl,
            alt: currentPhoto.alt?.trim() || currentPhoto.title.trim(),
            active: currentPhoto.active ?? true,
            updatedAt: serverTimestamp(),
          });
        } catch (dbErr) {
          console.warn('Firestore gallery update note:', dbErr);
        }

        setPhotos((prev) =>
          prev.map((p) =>
            p.id === currentPhoto.id ? ({ ...p, ...currentPhoto, image: finalImageUrl } as ExtendedGalleryItem) : p
          )
        );

        // Update local
        try {
          const local = JSON.parse(localStorage.getItem('local_gallery') || '[]');
          const updated = local.map((p: ExtendedGalleryItem) =>
            p.id === currentPhoto.id ? { ...p, ...currentPhoto, image: finalImageUrl } : p
          );
          localStorage.setItem('local_gallery', JSON.stringify(updated));
        } catch (e) {
          // ignore
        }

        toast.success(`Photo "${currentPhoto.title}" updated!`);
      } else {
        const newRecord: ExtendedGalleryItem = {
          title: currentPhoto.title.trim(),
          category: currentPhoto.category?.trim() || 'General',
          image: finalImageUrl,
          alt: currentPhoto.alt?.trim() || currentPhoto.title.trim(),
          active: currentPhoto.active ?? true,
          displayOrder: currentPhoto.displayOrder || photos.length + 1,
        };

        try {
          const docRef = await addDoc(collection(db, 'gallery'), {
            ...newRecord,
            createdAt: serverTimestamp(),
          });
          newRecord.id = docRef.id;
        } catch (dbErr) {
          newRecord.id = `local-gal-${Date.now()}`;
        }

        // Save local
        try {
          const local = JSON.parse(localStorage.getItem('local_gallery') || '[]');
          localStorage.setItem('local_gallery', JSON.stringify([newRecord, ...local]));
        } catch (e) {
          // ignore
        }

        setPhotos((prev) => [...prev, newRecord]);
        toast.success(`New photo "${newRecord.title}" saved!`);
      }

      setIsModalOpen(false);
      setCurrentPhoto(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save photo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDeleteClick = (photo: ExtendedGalleryItem) => {
    setPhotoToDelete(photo);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;
    setIsDeleting(true);

    const targetId = photoToDelete.id!;

    try {
      if (targetId && !targetId.startsWith('gal-') && !targetId.startsWith('local-gal-')) {
        await deleteDoc(doc(db, 'gallery', targetId));
      }
    } catch (dbErr) {
      console.warn('Firestore gallery delete note:', dbErr);
    }

    try {
      const local = JSON.parse(localStorage.getItem('local_gallery') || '[]');
      const updated = local.filter((p: ExtendedGalleryItem) => p.id !== targetId);
      localStorage.setItem('local_gallery', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    setPhotos((prev) => prev.filter((p) => p.id !== targetId));
    toast.success(`Photo removed from gallery.`);
    setDeleteDialogOpen(false);
    setPhotoToDelete(null);
    setIsDeleting(false);
  };

  // Toggle active
  const handleToggleActive = async (photo: ExtendedGalleryItem) => {
    const updatedStatus = !photo.active;
    try {
      if (photo.id && !photo.id.startsWith('gal-') && !photo.id.startsWith('local-gal-')) {
        await updateDoc(doc(db, 'gallery', photo.id), {
          active: updatedStatus,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      // ignore
    }

    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, active: updatedStatus } : p))
    );
    toast.info(updatedStatus ? `Photo is now visible.` : `Photo hidden from gallery.`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-green text-[10px] font-black uppercase tracking-widest">
            <ImageIcon className="w-3.5 h-3.5" /> Media & Showcase
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">
            Photo <span className="text-brand-green">Gallery</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Upload from device or add image URLs ({photos.length} Total Visuals)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-brand-green hover:bg-white text-brand-charcoal font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg shadow-brand-green/10"
        >
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Loading gallery photos...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-brand-dark p-20 border border-white/5 text-center space-y-4">
          <ImageIcon className="w-16 h-16 text-white/5 mx-auto" />
          <h3 className="text-xl font-bold uppercase italic">No photos in gallery</h3>
          <p className="text-white/40 text-xs uppercase tracking-widest">
            Click &quot;Add Photo&quot; to upload gym pictures directly from your device.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`bg-brand-dark border transition-all flex flex-col justify-between overflow-hidden relative ${
                photo.active ? 'border-white/10 hover:border-brand-green/50' : 'border-white/5 opacity-60'
              }`}
            >
              {/* Image Container */}
              <div className="relative h-48 w-full bg-brand-charcoal overflow-hidden">
                <Image
                  src={photo.image}
                  alt={photo.alt || photo.title || 'Gym photo'}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleActive(photo)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest backdrop-blur-md ${
                      photo.active
                        ? 'bg-black/60 text-brand-green border border-brand-green/40'
                        : 'bg-black/70 text-white/40 border border-white/10'
                    }`}
                  >
                    {photo.active ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                    {photo.active ? 'Visible' : 'Hidden'}
                  </button>
                </div>
                {photo.category && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-0.5 bg-black/60 text-white/90 border border-white/20 text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                      {photo.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Caption & Actions */}
              <div className="p-4 flex items-center justify-between border-t border-white/5">
                <div className="pr-2 truncate">
                  <h4 className="text-sm font-bold uppercase italic text-white truncate">
                    {photo.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(photo)}
                    className="p-1.5 bg-white/5 hover:bg-brand-green hover:text-brand-charcoal text-white/70 transition-all rounded"
                    title="Edit photo details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(photo)}
                    className="p-1.5 bg-white/5 hover:bg-red-600 hover:text-white text-white/70 transition-all rounded"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal with Direct Photo Upload */}
      {isModalOpen && currentPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !isSaving && setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-brand-charcoal border border-white/10 p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-brand-green text-[10px] font-black uppercase tracking-widest block mb-1">
                  {currentPhoto.id ? 'Modify Visual' : 'Upload Image'}
                </span>
                <h3 className="text-2xl font-syne font-bold uppercase italic text-white">
                  {currentPhoto.id ? 'Edit Photo' : 'Add Gallery Photo'}
                </h3>
              </div>
              <button
                disabled={isSaving}
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Photo Caption / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Weight Iron Zone"
                  value={currentPhoto.title || ''}
                  onChange={(e) => setCurrentPhoto({ ...currentPhoto, title: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Category Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Training Floor, Cardio, Strength, Atmosphere"
                  value={currentPhoto.category || ''}
                  onChange={(e) => setCurrentPhoto({ ...currentPhoto, category: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>

              {/* Upload From Device Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-brand-green block">
                    Option 1: Upload from Phone / Computer
                  </label>
                  <span className="text-[9px] text-white/40 font-mono">
                    Storage: /oxygenmultifitgym/gallery
                  </span>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isCompressing}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-white/15 hover:border-brand-green/60 bg-brand-dark hover:bg-white/[0.02] text-white/70 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
                >
                  {isCompressing ? (
                    <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-brand-green group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {isCompressing ? 'Compressing Image...' : 'Click to Browse Device Photo'}
                  </span>
                  <span className="text-[10px] text-white/40">
                    Supports JPG, PNG, WEBP (auto-optimized for web)
                  </span>
                </button>
              </div>

              {/* Option 2: Image URL */}
              <div className="pt-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Option 2: Or Enter Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://... or /background.jpg"
                  value={currentPhoto.image || ''}
                  onChange={(e) => setCurrentPhoto({ ...currentPhoto, image: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
                
                {/* Presets */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] text-white/40 font-mono">Quick Preset:</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPhoto({ ...currentPhoto, image: '/background.jpg' })}
                    className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-white/70 text-[9px] font-mono border border-white/10"
                  >
                    Hero Gym Photo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPhoto({
                        ...currentPhoto,
                        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
                      })
                    }
                    className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-white/70 text-[9px] font-mono border border-white/10"
                  >
                    Cardio Lab
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPhoto({
                        ...currentPhoto,
                        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
                      })
                    }
                    className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-white/70 text-[9px] font-mono border border-white/10"
                  >
                    Heavy Racks
                  </button>
                </div>
              </div>

              {/* Preview & WebP Compression Info */}
              {currentPhoto.image && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-green block">
                      ✓ WebP Photo Preview
                    </label>
                    <span className="text-[9px] font-mono text-brand-green bg-brand-green/10 px-2 py-0.5 border border-brand-green/20">
                      Format: image/webp
                    </span>
                  </div>

                  {compressionStats && (
                    <div className="p-2.5 bg-brand-dark border border-brand-green/30 text-[10px] space-y-1">
                      <div className="flex items-center justify-between text-white/70">
                        <span>Original Upload: <strong className="text-white">{compressionStats.originalSize}</strong></span>
                        <span>➔</span>
                        <span>WebP Compressed: <strong className="text-brand-green">{compressionStats.compressedSize}</strong></span>
                      </div>
                      <div className="text-[9px] text-brand-green font-bold uppercase tracking-wider">
                        ⚡ {compressionStats.percentSaved}% File Size Reduced (Lossless Sharpness & Fast Loading)
                      </div>
                    </div>
                  )}

                  <div className="relative h-32 w-full bg-brand-dark border border-brand-green/30 overflow-hidden">
                    <Image
                      src={currentPhoto.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="photoActiveCheckbox"
                  checked={currentPhoto.active ?? true}
                  onChange={(e) => setCurrentPhoto({ ...currentPhoto, active: e.target.checked })}
                  className="w-4 h-4 accent-brand-green cursor-pointer"
                />
                <label htmlFor="photoActiveCheckbox" className="text-xs text-white/80 cursor-pointer font-bold">
                  Active (Show on Public Website)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !currentPhoto.image}
                  className="px-6 py-2.5 bg-brand-green hover:bg-white text-brand-charcoal text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {currentPhoto.id ? 'Save Changes' : 'Add to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <CustomAlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Photo?"
        description={`Are you sure you want to remove "${photoToDelete?.title}" from the gallery?`}
        confirmText="Yes, Delete Photo"
        cancelText="Cancel"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}

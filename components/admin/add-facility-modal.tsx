'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface AddFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFacilityModal({ isOpen, onClose }: AddFacilityModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'facilities'), {
        name,
        description,
        imageUrl,
        createdAt: new Date(),
      });
      onClose();
      setName('');
      setDescription('');
      setImageUrl('');
    } catch (error) {
      console.error('Error adding facility:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-brand-dark border border-white/10 p-8 w-full max-w-lg space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic">Add Facility</h2>
              <button onClick={onClose}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Facility Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-charcoal border border-white/10 p-4 text-white uppercase tracking-widest text-xs"
                required
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-brand-charcoal border border-white/10 p-4 text-white uppercase tracking-widest text-xs h-32"
                required
              />
              <input
                type="url"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-brand-charcoal border border-white/10 p-4 text-white uppercase tracking-widest text-xs"
                required
              />
              <button
                type="submit"
                className="w-full py-4 bg-brand-green text-brand-charcoal font-black uppercase tracking-widest text-xs hover:bg-white transition-all"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Facility'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

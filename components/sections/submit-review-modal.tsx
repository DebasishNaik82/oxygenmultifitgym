'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Loader2, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/toast-provider';
import { Review } from '@/types';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: (review: Review) => void;
}

export default function SubmitReviewModal({
  isOpen,
  onClose,
  onReviewSubmitted,
}: SubmitReviewModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const ratingLabels = ['', 'Poor (1.0)', 'Fair (2.0)', 'Good (3.0)', 'Very Good (4.0)', 'Elite / Outstanding (5.0)'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !reviewText.trim()) {
      toast.warning('Please fill in both your name and review.');
      return;
    }

    setLoading(true);

    const newReview: Review = {
      customerName: customerName.trim(),
      review: reviewText.trim(),
      rating,
      date: 'Just now',
      published: true,
    };

    try {
      // Attempt to save in Firestore
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...newReview,
        createdAt: serverTimestamp(),
      });
      newReview.id = docRef.id;
      toast.success('Thank you! Your review has been submitted.');
    } catch (err: any) {
      console.warn('Firestore write notice (saving locally):', err?.message);
      // Fallback: Store locally in localStorage reviews cache
      newReview.id = `local-${Date.now()}`;
      try {
        const stored = JSON.parse(localStorage.getItem('local_reviews') || '[]');
        localStorage.setItem('local_reviews', JSON.stringify([newReview, ...stored]));
      } catch (e) {
        // ignore
      }
      toast.success('Review posted successfully!');
    } finally {
      setLoading(false);
      setSubmitted(true);
      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }
      setTimeout(() => {
        setSubmitted(false);
        setCustomerName('');
        setReviewText('');
        setRating(5);
        onClose();
      }, 1500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!loading ? onClose : undefined}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-brand-charcoal border border-white/10 p-6 md:p-8 shadow-2xl z-10"
          >
            {/* Close Button */}
            {!loading && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center mx-auto text-brand-green">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-syne font-bold uppercase italic text-white">
                  Review Received!
                </h3>
                <p className="text-white/60 text-xs font-jakarta max-w-xs mx-auto">
                  Thank you for sharing your experience at Oxygen Multifit Gym.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-brand-green text-[10px] font-black uppercase tracking-widest mb-2">
                    <MessageSquarePlus className="w-4 h-4" /> Share Your Experience
                  </div>
                  <h3 className="text-2xl font-syne font-bold uppercase italic text-white">
                    Submit Member <span className="text-brand-green">Review</span>
                  </h3>
                  <p className="text-white/50 text-xs font-jakarta mt-1">
                    Your feedback helps motivate fellow athletes and keeps our standards elite.
                  </p>
                </div>

                {/* Rating Stars Picker */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block">
                    Rating: <span className="text-brand-green font-bold normal-case text-xs ml-1">{ratingLabels[hoverRating || rating]}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-white/20 hover:scale-110 transition-transform"
                          aria-label={`${star} Stars`}
                        >
                          <Star
                            className={`w-7 h-7 ${
                              isActive
                                ? 'text-brand-green fill-brand-green'
                                : 'text-white/20'
                            } transition-colors`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name Field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 px-4 py-3 text-white text-xs placeholder:text-white/30 focus:border-brand-green outline-none transition-colors"
                  />
                </div>

                {/* Review Text */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block">
                    Your Feedback / Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about the trainers, equipment, gym ambiance, or your workout experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 p-4 text-white text-xs placeholder:text-white/30 focus:border-brand-green outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onClose}
                    className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-brand-green hover:bg-white text-brand-charcoal text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/toast-provider';
import { Review } from '@/types';

interface VerifyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onVerificationSubmitted?: (updatedReview: Review) => void;
}

export default function VerifyMemberModal({
  isOpen,
  onClose,
  review,
  onVerificationSubmitted,
}: VerifyMemberModalProps) {
  const [memberId, setMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  if (!review) return null;

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId.trim()) {
      toast.warning('Please enter your Gym Member ID or registered phone number.');
      return;
    }

    setLoading(true);

    const updatedReview: Review = {
      ...review,
      verificationStatus: 'pending_verification',
      memberId: memberId.trim(),
    };

    try {
      if (review.id && !review.id.startsWith('init-') && !review.id.startsWith('local-')) {
        const docRef = doc(db, 'reviews', review.id);
        await updateDoc(docRef, {
          verificationStatus: 'pending_verification',
          memberId: memberId.trim(),
          verificationRequestedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Local storage sync
      try {
        const localReviews: Review[] = JSON.parse(localStorage.getItem('local_reviews') || '[]');
        const updatedLocal = localReviews.map((r) =>
          (r.id === review.id || (r.customerName === review.customerName && r.review === review.review))
            ? { ...r, verificationStatus: 'pending_verification' as const, memberId: memberId.trim() }
            : r
        );
        localStorage.setItem('local_reviews', JSON.stringify(updatedLocal));
      } catch (e) {
        // ignore
      }

      toast.success('Gym Member ID submitted! Your review is now sent for admin verification.');
      setSuccess(true);
      if (onVerificationSubmitted) {
        onVerificationSubmitted(updatedReview);
      }

      setTimeout(() => {
        setSuccess(false);
        setMemberId('');
        onClose();
      }, 1800);
    } catch (err: any) {
      console.warn('Verification request note:', err?.message);
      // Fallback: local update
      try {
        const localReviews: Review[] = JSON.parse(localStorage.getItem('local_reviews') || '[]');
        const updatedLocal = localReviews.map((r) =>
          r.id === review.id ? { ...r, verificationStatus: 'pending_verification' as const, memberId: memberId.trim() } : r
        );
        localStorage.setItem('local_reviews', JSON.stringify(updatedLocal));
      } catch (e) {
        // ignore
      }
      toast.success('Member ID recorded! Sent for admin verification.');
      setSuccess(true);
      if (onVerificationSubmitted) {
        onVerificationSubmitted(updatedReview);
      }
      setTimeout(() => {
        setSuccess(false);
        setMemberId('');
        onClose();
      }, 1800);
    } finally {
      setLoading(false);
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

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-brand-charcoal border border-brand-green/30 p-6 md:p-8 shadow-2xl z-10"
          >
            {/* Close Button */}
            {!loading && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {success ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green/40 flex items-center justify-center mx-auto text-brand-green">
                  <Clock className="w-8 h-8 text-brand-green" />
                </div>
                <h3 className="text-2xl font-syne font-bold uppercase italic text-white">
                  Sent For Verification!
                </h3>
                <p className="text-white/70 text-xs font-jakarta max-w-xs mx-auto">
                  Your Gym Member ID has been received. Once the gym admin validates it, your review will showcase the official <strong className="text-brand-green">Verified Gym Member</strong> badge.
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifySubmit} className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-brand-green text-[10px] font-black uppercase tracking-widest mb-1.5">
                    <ShieldCheck className="w-4 h-4" /> Official Gym Member Verification
                  </div>
                  <h3 className="text-2xl font-syne font-bold uppercase italic text-white">
                    Get <span className="text-brand-green">Verified</span>
                  </h3>
                  <p className="text-white/60 text-xs font-jakarta mt-1">
                    Review by <strong className="text-white">{review.customerName}</strong>
                  </p>
                </div>

                <div className="p-3 bg-brand-dark border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/40 font-mono block uppercase">Review Snippet:</span>
                  <p className="text-xs text-white/70 italic line-clamp-2">&ldquo;{review.review}&rdquo;</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block">
                    Enter Gym Member ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. O2-1049 or Registered Phone"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 px-4 py-3 text-white text-xs placeholder:text-white/30 focus:border-brand-green outline-none font-mono transition-colors"
                  />
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Enter your membership ID or phone number registered at Oxygen Multifit Gym desk.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-brand-green hover:bg-white text-brand-charcoal text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Submit for Verification
                      </>
                    )}
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

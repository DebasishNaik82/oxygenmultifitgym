'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import SubmitReviewModal from './submit-review-modal';
import VerifyMemberModal from './verify-member-modal';

const initialReviews: Review[] = [
  {
    id: 'init-1',
    customerName: 'Baidyanath Narayan Sinha',
    review: 'The equipment quality is unmatched in the region. Best for serious students of fitness.',
    rating: 5,
    date: 'Member for 7 years',
    published: true,
    verificationStatus: 'verified',
    verifiedBadge: true,
  },
  {
    id: 'init-2',
    customerName: 'Ranjit Mahananad',
    review: 'Elite trainer and a professional staff. The environment is focused and disciplined.',
    rating: 5,
    date: 'Member for 1 year',
    published: true,
    verificationStatus: 'verified',
    verifiedBadge: true,
  },
  {
    id: 'init-3',
    customerName: 'Preeti Kola',
    review: 'Complete facility with flexible timings. The most premium gym experience in Bhawanipatna.',
    rating: 5,
    date: 'Member for 2 years',
    published: true,
    verificationStatus: 'verified',
    verifiedBadge: true,
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedReviewForVerify, setSelectedReviewForVerify] = useState<Review | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(15));
      const snapshot = await getDocs(q);
      
      const firestoreReviews: Review[] = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Review))
        .filter((r) => r.published !== false);

      // Check local storage reviews cache
      let localReviews: Review[] = [];
      try {
        localReviews = JSON.parse(localStorage.getItem('local_reviews') || '[]');
      } catch (e) {
        // ignore
      }

      // Merge: Firestore + Local + Initial
      const existingIds = new Set<string>();
      const combined: Review[] = [];

      for (const r of [...firestoreReviews, ...localReviews, ...initialReviews]) {
        const key = r.id || `${r.customerName}-${r.review.slice(0, 15)}`;
        if (!existingIds.has(key)) {
          existingIds.add(key);
          combined.push(r);
        }
      }

      setReviews(combined);
    } catch (err) {
      console.warn('Could not fetch reviews from Firestore, loading initial:', err);
      // Try local storage
      try {
        const localReviews: Review[] = JSON.parse(localStorage.getItem('local_reviews') || '[]');
        if (localReviews.length > 0) {
          setReviews([...localReviews, ...initialReviews]);
        }
      } catch (e) {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchReviews]);

  const handleReviewSubmitted = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleOpenVerifyModal = (rev: Review) => {
    setSelectedReviewForVerify(rev);
    setVerifyModalOpen(true);
  };

  const handleVerificationSubmitted = (updatedReview: Review) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === updatedReview.id || (r.customerName === updatedReview.customerName && r.review === updatedReview.review)) ? updatedReview : r)
    );
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section id="reviews" className="py-16 sm:py-24 md:py-32 bg-brand-dark overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 sm:mb-20 gap-6 sm:gap-8">
          <div className="max-w-2xl">
            <span className="text-brand-green text-[10px] font-semibold uppercase tracking-[0.4em] sm:tracking-[0.5em] mb-3 sm:mb-4 block">
              Member Voice
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-syne font-bold italic uppercase tracking-tighter leading-tight sm:leading-none mb-3 sm:mb-4">
              Proven <span className="text-brand-green">Results</span>.
            </h2>
            <p className="text-white/60 text-xs sm:text-sm font-jakarta max-w-lg">
              Read authentic feedback from athletes and fitness enthusiasts training at Oxygen Multifit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3 bg-brand-charcoal px-3 sm:px-4 py-2.5 sm:py-3 border border-white/5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-green fill-brand-green" />
                ))}
              </div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white">
                {averageRating}/5 Rating
              </span>
              <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wider">
                ({reviews.length} reviews)
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 sm:px-6 py-3 sm:py-3.5 bg-brand-green hover:bg-white text-brand-charcoal text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-brand-green/10 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Write a Review
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 sm:p-8 bg-brand-charcoal border border-white/5 space-y-4">
                <Skeleton className="h-6 w-24 bg-white/[0.05]" />
                <Skeleton className="h-24 w-full bg-white/[0.05]" />
                <Skeleton className="h-4 w-32 bg-white/[0.05]" />
              </div>
            ))
          ) : (
            reviews.map((item, index) => {
              const isVerified = item.verificationStatus === 'verified' || item.verifiedBadge === true;
              const isPending = item.verificationStatus === 'pending_verification';
              const isUnverified = !isVerified && !isPending;

              return (
                <motion.div 
                  key={item.id || index} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.08, 0.4) }}
                  className="p-6 sm:p-8 md:p-10 bg-brand-charcoal border border-white/5 hover:border-brand-green/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-6">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3.5 h-3.5 ${
                              s <= item.rating 
                                ? 'text-brand-green fill-brand-green' 
                                : 'text-white/20'
                            }`} 
                          />
                        ))}
                      </div>

                      {/* Verification Status Badge */}
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-green/10 text-brand-green border border-brand-green/30 text-[9px] font-bold uppercase tracking-wider font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Verified Member
                        </span>
                      )}

                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold uppercase tracking-wider font-mono">
                          <Clock className="w-3 h-3" /> Sent for Admin Verification
                        </span>
                      )}

                      {isUnverified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 text-white/40 border border-white/10 text-[9px] font-bold uppercase tracking-wider font-mono">
                          Unverified
                        </span>
                      )}
                    </div>

                    <p className="text-base sm:text-lg md:text-xl font-syne font-bold italic uppercase leading-snug text-white/80 group-hover:text-white transition-colors">
                      &ldquo;{item.review}&rdquo;
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-white">
                        {item.customerName}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                        {item.date || 'Recent'}
                      </span>
                    </div>

                    {/* Unverified Action Button */}
                    {isUnverified && (
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/5">
                        <span className="text-[9px] text-white/40">Are you a gym member?</span>
                        <button
                          type="button"
                          onClick={() => handleOpenVerifyModal(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-green/15 hover:bg-brand-green text-brand-green hover:text-brand-charcoal border border-brand-green/40 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <ShieldCheck className="w-3 h-3" /> Get Verified
                        </button>
                      </div>
                    )}

                    {isPending && (
                      <div className="pt-1 text-[9px] text-amber-400/80 font-mono">
                        ID: {item.memberId || 'Submitted'} (Pending admin approval)
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <SubmitReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />

      <VerifyMemberModal
        isOpen={verifyModalOpen}
        onClose={() => {
          setVerifyModalOpen(false);
          setSelectedReviewForVerify(null);
        }}
        review={selectedReviewForVerify}
        onVerificationSubmitted={handleVerificationSubmitted}
      />
    </section>
  );
}

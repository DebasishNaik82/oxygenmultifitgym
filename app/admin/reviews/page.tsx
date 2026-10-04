'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Star, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Search, 
  Loader2, 
  Check, 
  X,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2
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
import { db } from '@/lib/firebase';
import { Review, VerificationStatus } from '@/types';
import { useToast } from '@/components/ui/toast-provider';
import CustomAlertDialog from '@/components/ui/custom-dialog';

const defaultReviews: Review[] = [
  {
    id: 'sample-1',
    customerName: 'Baidyanath Narayan Sinha',
    review: 'The equipment quality is unmatched in the region. Best for serious students of fitness.',
    rating: 5,
    date: '7 years ago',
    published: true,
    verificationStatus: 'verified',
    verifiedBadge: true,
  },
  {
    id: 'sample-2',
    customerName: 'Ranjit Mahananad',
    review: 'Elite trainer and a professional staff. The environment is focused and disciplined.',
    rating: 5,
    date: '1 year ago',
    published: true,
    verificationStatus: 'verified',
    verifiedBadge: true,
  },
  {
    id: 'sample-3',
    customerName: 'Preeti Kola',
    review: 'Complete facility with flexible timings. The most premium gym experience in Bhawanipatna.',
    rating: 5,
    date: '2 years ago',
    published: true,
    verificationStatus: 'verified',
    verifiedBadge: true,
  },
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'verified' | 'unverified'>('all');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Partial<Review> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Custom Alert Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: Review[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      } as Review));

      let localReviews: Review[] = [];
      try {
        localReviews = JSON.parse(localStorage.getItem('local_reviews') || '[]');
      } catch (e) {
        // ignore
      }

      if (items.length === 0 && localReviews.length === 0) {
        setReviews(defaultReviews);
      } else {
        // Merge without duplicates
        const map = new Map<string, Review>();
        defaultReviews.forEach(r => map.set(r.id!, r));
        localReviews.forEach(r => map.set(r.id!, r));
        items.forEach(r => map.set(r.id!, r));
        setReviews(Array.from(map.values()));
      }
    } catch (err: any) {
      console.warn('Error fetching Firestore reviews:', err?.message);
      try {
        const localReviews: Review[] = JSON.parse(localStorage.getItem('local_reviews') || '[]');
        setReviews(localReviews.length > 0 ? [...localReviews, ...defaultReviews] : defaultReviews);
      } catch (e) {
        setReviews(defaultReviews);
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

  // Open Add Modal
  const handleOpenAdd = () => {
    setCurrentReview({
      customerName: '',
      rating: 5,
      review: '',
      published: true,
      verificationStatus: 'unverified',
      memberId: '',
      date: 'Just now',
    });
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (review: Review) => {
    setCurrentReview({ ...review });
    setIsEditModalOpen(true);
  };

  // Quick Verify Member
  const handleVerifyMember = async (review: Review) => {
    try {
      if (review.id && !review.id.startsWith('sample-') && !review.id.startsWith('local-')) {
        const docRef = doc(db, 'reviews', review.id);
        await updateDoc(docRef, {
          verificationStatus: 'verified',
          verifiedBadge: true,
          updatedAt: serverTimestamp(),
        });
      }

      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, verificationStatus: 'verified' as const, verifiedBadge: true } : r
        )
      );

      try {
        const local = JSON.parse(localStorage.getItem('local_reviews') || '[]');
        const updated = local.map((r: Review) =>
          r.id === review.id ? { ...r, verificationStatus: 'verified' as const, verifiedBadge: true } : r
        );
        localStorage.setItem('local_reviews', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }

      toast.success(`Verified member status granted for "${review.customerName}"!`);
    } catch (err: any) {
      toast.error('Failed to update verification status.');
    }
  };

  // Quick Reject / Mark Unverified
  const handleRejectVerification = async (review: Review) => {
    try {
      if (review.id && !review.id.startsWith('sample-') && !review.id.startsWith('local-')) {
        const docRef = doc(db, 'reviews', review.id);
        await updateDoc(docRef, {
          verificationStatus: 'unverified',
          verifiedBadge: false,
          updatedAt: serverTimestamp(),
        });
      }

      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, verificationStatus: 'unverified' as const, verifiedBadge: false } : r
        )
      );

      try {
        const local = JSON.parse(localStorage.getItem('local_reviews') || '[]');
        const updated = local.map((r: Review) =>
          r.id === review.id ? { ...r, verificationStatus: 'unverified' as const, verifiedBadge: false } : r
        );
        localStorage.setItem('local_reviews', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }

      toast.info(`Review by "${review.customerName}" marked as unverified.`);
    } catch (err: any) {
      toast.error('Failed to update verification status.');
    }
  };

  // Save (Create or Update)
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReview?.customerName?.trim() || !currentReview?.review?.trim()) {
      toast.warning('Customer name and review text are required.');
      return;
    }

    setIsSaving(true);
    const isEdit = Boolean(currentReview.id && !currentReview.id.startsWith('sample-'));
    const isVerified = currentReview.verificationStatus === 'verified';

    try {
      if (isEdit && currentReview.id) {
        // Update in Firestore
        const reviewRef = doc(db, 'reviews', currentReview.id);
        await updateDoc(reviewRef, {
          customerName: currentReview.customerName.trim(),
          rating: Number(currentReview.rating) || 5,
          review: currentReview.review.trim(),
          published: currentReview.published ?? true,
          verificationStatus: currentReview.verificationStatus || 'unverified',
          memberId: currentReview.memberId?.trim() || '',
          verifiedBadge: isVerified,
          updatedAt: serverTimestamp(),
        });

        setReviews((prev) =>
          prev.map((r) => (r.id === currentReview.id ? ({ ...r, ...currentReview, verifiedBadge: isVerified } as Review) : r))
        );
        toast.success(`Review for "${currentReview.customerName}" updated successfully!`);
      } else {
        // Create new in Firestore
        const newRecord: Review = {
          customerName: currentReview.customerName.trim(),
          rating: Number(currentReview.rating) || 5,
          review: currentReview.review.trim(),
          published: currentReview.published ?? true,
          verificationStatus: currentReview.verificationStatus || 'unverified',
          memberId: currentReview.memberId?.trim() || '',
          verifiedBadge: isVerified,
          date: currentReview.date || 'Just now',
        };

        try {
          const docRef = await addDoc(collection(db, 'reviews'), {
            ...newRecord,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          newRecord.id = docRef.id;
        } catch (dbErr) {
          newRecord.id = `local-${Date.now()}`;
          const local = JSON.parse(localStorage.getItem('local_reviews') || '[]');
          localStorage.setItem('local_reviews', JSON.stringify([newRecord, ...local]));
        }

        setReviews((prev) => [newRecord, ...prev]);
        toast.success(`Review for "${newRecord.customerName}" added successfully!`);
      }

      setIsEditModalOpen(false);
      setCurrentReview(null);
    } catch (err: any) {
      console.error('Error saving review:', err);
      toast.error(err?.message || 'Failed to save review. Please check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Delete confirmation
  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);

    try {
      if (reviewToDelete.id && !reviewToDelete.id.startsWith('sample-') && !reviewToDelete.id.startsWith('local-')) {
        await deleteDoc(doc(db, 'reviews', reviewToDelete.id));
      }

      try {
        const local = JSON.parse(localStorage.getItem('local_reviews') || '[]');
        const updated = local.filter((r: Review) => r.id !== reviewToDelete.id);
        localStorage.setItem('local_reviews', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
      toast.success(`Review by "${reviewToDelete.customerName}" deleted.`);
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    } catch (err: any) {
      toast.error('Failed to delete review.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle publish
  const handleTogglePublish = async (review: Review) => {
    const updatedStatus = !review.published;
    try {
      if (review.id && !review.id.startsWith('sample-') && !review.id.startsWith('local-')) {
        const reviewRef = doc(db, 'reviews', review.id);
        await updateDoc(reviewRef, {
          published: updatedStatus,
          updatedAt: serverTimestamp(),
        });
      }
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, published: updatedStatus } : r))
      );
      if (updatedStatus) {
        toast.success(`Review published live on website!`);
      } else {
        toast.info(`Review hidden from public view.`);
      }
    } catch (err: any) {
      console.error('Toggle error:', err);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, published: updatedStatus } : r))
      );
      toast.info(updatedStatus ? 'Review marked as published.' : 'Review marked as hidden.');
    }
  };

  const pendingCount = reviews.filter((r) => r.verificationStatus === 'pending_verification').length;

  const filteredReviews = reviews.filter((r) => {
    const matchSearch =
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.memberId && r.memberId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRating = ratingFilter === 'all' || r.rating === ratingFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && r.published) ||
      (statusFilter === 'hidden' && !r.published);
    const matchVerification =
      verificationFilter === 'all' ||
      (verificationFilter === 'pending' && r.verificationStatus === 'pending_verification') ||
      (verificationFilter === 'verified' && (r.verificationStatus === 'verified' || r.verifiedBadge === true)) ||
      (verificationFilter === 'unverified' && r.verificationStatus !== 'verified' && r.verificationStatus !== 'pending_verification' && !r.verifiedBadge);
    return matchSearch && matchRating && matchStatus && matchVerification;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-green text-[10px] font-black uppercase tracking-widest">
            <MessageSquare className="w-3.5 h-3.5" /> Content Management
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">
            Customer <span className="text-brand-green">Reviews</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Moderate feedback & verify Oxygen Multifit Gym Members
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-brand-green hover:bg-white text-brand-charcoal font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg shadow-brand-green/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Review
        </button>
      </div>

      {/* Pending verification alert banner */}
      {pendingCount > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {pendingCount} Review{pendingCount > 1 ? 's' : ''} Pending Member Verification
              </p>
              <p className="text-[11px] text-white/60">
                Gym members have submitted their Member ID requesting verification badges.
              </p>
            </div>
          </div>
          <button
            onClick={() => setVerificationFilter('pending')}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            Review Pending ({pendingCount})
          </button>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-brand-dark p-4 border border-white/5">
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, text, member ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-charcoal border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-brand-green outline-none"
          />
        </div>

        {/* Verification Status Filter */}
        <div>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as any)}
            className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-xs text-white outline-none focus:border-brand-green font-bold"
          >
            <option value="all">All Verification (Any)</option>
            <option value="pending">⏳ Pending Verification ({pendingCount})</option>
            <option value="verified">✓ Verified Members</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>

        {/* Rating filter */}
        <div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-xs text-white outline-none focus:border-brand-green"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars (Elite)</option>
            <option value="4">4 Stars (Very Good)</option>
            <option value="3">3 Stars (Average)</option>
            <option value="2">2 Stars (Fair)</option>
            <option value="1">1 Star (Poor)</option>
          </select>
        </div>

        {/* Status filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-xs text-white outline-none focus:border-brand-green"
          >
            <option value="all">All Visibility</option>
            <option value="published">Published Live</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Table / List */}
      <div className="bg-brand-dark border border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Star className="w-12 h-12 text-white/10 mx-auto" />
            <h3 className="text-lg font-bold uppercase italic text-white/70">No reviews found</h3>
            <p className="text-white/40 text-xs max-w-sm mx-auto">
              No reviews match your current filters. Try resetting the search or add a new review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/50">
                  <th className="px-6 py-4">Customer & Member ID</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Review Text</th>
                  <th className="px-6 py-4">Member Verification</th>
                  <th className="px-6 py-4">Visibility</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredReviews.map((r) => {
                  const isVerified = r.verificationStatus === 'verified' || r.verifiedBadge === true;
                  const isPending = r.verificationStatus === 'pending_verification';

                  return (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Customer & Member ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-white flex items-center gap-2">
                          {r.customerName}
                        </div>
                        {r.memberId ? (
                          <span className="text-[10px] text-brand-green font-mono font-bold block mt-0.5">
                            Member ID: {r.memberId}
                          </span>
                        ) : (
                          <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider block mt-0.5">
                            {r.date || 'Member'}
                          </span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= r.rating ? 'text-brand-green fill-brand-green' : 'text-white/20'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-white/70">
                            {r.rating}.0
                          </span>
                        </div>
                      </td>

                      {/* Review text */}
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-white/80 line-clamp-2 italic leading-relaxed">
                          &ldquo;{r.review}&rdquo;
                        </p>
                      </td>

                      {/* Member Verification Badge & Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isVerified && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-green/15 text-brand-green border border-brand-green/30 text-[10px] font-bold uppercase tracking-wider font-mono">
                              <CheckCircle2 className="w-3 h-3" /> Verified Member
                            </span>
                            <button
                              onClick={() => handleRejectVerification(r)}
                              className="text-[9px] text-white/40 hover:text-white uppercase underline cursor-pointer"
                              title="Revoke verified status"
                            >
                              Revoke
                            </button>
                          </div>
                        )}

                        {isPending && (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider font-mono">
                              <Clock className="w-3 h-3 animate-pulse" /> Pending Approval
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleVerifyMember(r)}
                                className="px-2 py-0.5 bg-brand-green hover:bg-white text-brand-charcoal text-[9px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                Approve ✓
                              </button>
                              <button
                                onClick={() => handleRejectVerification(r)}
                                className="px-2 py-0.5 bg-white/10 hover:bg-red-600 hover:text-white text-white/60 text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Reject ✕
                              </button>
                            </div>
                          </div>
                        )}

                        {!isVerified && !isPending && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 text-white/40 border border-white/10 text-[9px] font-bold uppercase tracking-wider font-mono">
                              Unverified
                            </span>
                            <button
                              onClick={() => handleVerifyMember(r)}
                              className="px-2 py-0.5 bg-white/10 hover:bg-brand-green hover:text-brand-charcoal text-white/70 text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Verify
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Visibility Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublish(r)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                            r.published
                              ? 'bg-brand-green/20 text-brand-green border border-brand-green/30 hover:bg-brand-green/30'
                              : 'bg-white/10 text-white/50 border border-white/10 hover:bg-white/20'
                          }`}
                          title="Click to toggle publish status"
                        >
                          {r.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {r.published ? 'Published' : 'Hidden'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-2 bg-white/5 hover:bg-brand-green hover:text-brand-charcoal text-white/70 transition-all rounded cursor-pointer"
                            title="Edit review"
                            aria-label="Edit review"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteClick(r)}
                            className="p-2 bg-white/5 hover:bg-red-600 hover:text-white text-white/70 transition-all rounded cursor-pointer"
                            title="Delete review"
                            aria-label="Delete review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Review Modal */}
      {isEditModalOpen && currentReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => !isSaving && setIsEditModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-brand-charcoal border border-white/10 p-6 md:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-brand-green text-[10px] font-black uppercase tracking-widest block mb-1">
                  {currentReview.id ? 'Modify Review' : 'Create New'}
                </span>
                <h3 className="text-2xl font-syne font-bold uppercase italic text-white">
                  {currentReview.id ? 'Edit Review' : 'Add Member Review'}
                </h3>
              </div>
              <button
                disabled={isSaving}
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={currentReview.customerName || ''}
                  onChange={(e) =>
                    setCurrentReview({ ...currentReview, customerName: e.target.value })
                  }
                  className="w-full bg-brand-dark border border-white/10 px-4 py-3 text-white text-xs placeholder:text-white/30 focus:border-brand-green outline-none"
                />
              </div>

              {/* Gym Member ID */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-brand-green block mb-1">
                  Gym Member ID (for verification badge)
                </label>
                <input
                  type="text"
                  placeholder="e.g. O2-1048 or Phone"
                  value={currentReview.memberId || ''}
                  onChange={(e) =>
                    setCurrentReview({ ...currentReview, memberId: e.target.value })
                  }
                  className="w-full bg-brand-dark border border-white/10 px-4 py-3 text-white text-xs placeholder:text-white/30 focus:border-brand-green outline-none font-mono"
                />
              </div>

              {/* Verification Status Selector */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Member Verification Status
                </label>
                <select
                  value={currentReview.verificationStatus || 'unverified'}
                  onChange={(e) =>
                    setCurrentReview({
                      ...currentReview,
                      verificationStatus: e.target.value as VerificationStatus,
                      verifiedBadge: e.target.value === 'verified',
                    })
                  }
                  className="w-full bg-brand-dark border border-white/10 px-3 py-2.5 text-xs text-white outline-none focus:border-brand-green font-bold"
                >
                  <option value="unverified">Unverified (Standard Visitor)</option>
                  <option value="pending_verification">⏳ Pending Admin Verification</option>
                  <option value="verified">✓ Verified Gym Member</option>
                </select>
              </div>

              {/* Rating selection */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Star Rating *
                </label>
                <div className="flex items-center gap-2 bg-brand-dark p-3 border border-white/10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCurrentReview({ ...currentReview, rating: star })}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          (currentReview.rating || 5) >= star
                            ? 'text-brand-green fill-brand-green'
                            : 'text-white/20'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-brand-green ml-3">
                    {currentReview.rating || 5} Stars
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Review Text *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the customer's quote or feedback..."
                  value={currentReview.review || ''}
                  onChange={(e) =>
                    setCurrentReview({ ...currentReview, review: e.target.value })
                  }
                  className="w-full bg-brand-dark border border-white/10 p-4 text-white text-xs placeholder:text-white/30 focus:border-brand-green outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Published checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="publishedCheckbox"
                  checked={currentReview.published ?? true}
                  onChange={(e) =>
                    setCurrentReview({ ...currentReview, published: e.target.checked })
                  }
                  className="w-4 h-4 accent-brand-green cursor-pointer"
                />
                <label
                  htmlFor="publishedCheckbox"
                  className="text-xs font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none"
                >
                  Publish live on website immediately
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-brand-green hover:bg-white text-brand-charcoal text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {currentReview.id ? 'Save Changes' : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert Dialog for Deletion */}
      <CustomAlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Member Review?"
        description={`Are you sure you want to permanently remove the review by "${reviewToDelete?.customerName}"? This action cannot be undone.`}
        confirmText="Yes, Delete Review"
        cancelText="Keep Review"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}

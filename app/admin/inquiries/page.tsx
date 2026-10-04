'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Inquiry, InquiryStatus } from '@/types';
import { 
  Search, 
  Filter, 
  Phone, 
  MessageCircle, 
  MessageSquare,
  Trash2, 
  ChevronRight,
  X,
  Mail,
  CheckCircle2,
  Clock,
  UserCheck,
  Ban
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast-provider';
import CustomAlertDialog from '@/components/ui/custom-dialog';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [inquiryToDeleteName, setInquiryToDeleteName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  useEffect(() => {
    let local: Inquiry[] = [];
    try {
      local = JSON.parse(localStorage.getItem('local_inquiries') || '[]');
    } catch (e) {
      // ignore
    }

    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
        const existingIds = new Set(docs.map(d => d.id));
        const merged = [...docs, ...local.filter(l => !existingIds.has(l.id))];
        setInquiries(merged);
        setLoading(false);
      },
      (err) => {
        console.warn('Firestore inquiries note (using local cache):', err?.message);
        setInquiries(local);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inquiry.phone.includes(searchTerm) ||
      (inquiry.email && inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Update Status
  const handleUpdateStatus = async (id: string, status: InquiryStatus) => {
    // 1. Optimistic state update
    setInquiries(prev => 
      prev.map(item => item.id === id ? { ...item, status } : item)
    );

    if (selectedInquiry?.id === id) {
      setSelectedInquiry(prev => prev ? { ...prev, status } : null);
    }

    // 2. LocalStorage sync
    try {
      const local = JSON.parse(localStorage.getItem('local_inquiries') || '[]');
      const updated = local.map((item: Inquiry) => 
        item.id === id ? { ...item, status } : item
      );
      localStorage.setItem('local_inquiries', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    // 3. Firestore sync
    try {
      if (id && !id.startsWith('seed-inq-') && !id.startsWith('local-inq-')) {
        await updateDoc(doc(db, 'inquiries', id), {
          status,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      console.warn("Firestore status update note:", err?.message);
    }

    const readable = status.replace('_', ' ').toUpperCase();
    toast.success(`Inquiry status updated to ${readable}!`);
  };

  // Open Delete
  const handleOpenDelete = (inquiry: Inquiry) => {
    setDeleteId(inquiry.id!);
    setInquiryToDeleteName(inquiry.name);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    const id = deleteId;

    // 1. Update React state immediately
    setInquiries(prev => prev.filter(i => i.id !== id));
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(null);
    }

    // 2. Update LocalStorage
    try {
      const local = JSON.parse(localStorage.getItem('local_inquiries') || '[]');
      const filtered = local.filter((i: Inquiry) => i.id !== id);
      localStorage.setItem('local_inquiries', JSON.stringify(filtered));
    } catch (e) {
      // ignore
    }

    // 3. Update Firestore
    try {
      if (id && !id.startsWith('seed-inq-') && !id.startsWith('local-inq-')) {
        await deleteDoc(doc(db, 'inquiries', id));
      }
    } catch (err: any) {
      console.warn("Firestore delete inquiry note:", err?.message);
    }

    setIsDeleting(false);
    setDeleteId(null);
    toast.success(`Inquiry for "${inquiryToDeleteName}" deleted successfully.`);
  };

  const statusOptions: { value: InquiryStatus; label: string; color: string }[] = [
    { value: 'new', label: 'New', color: 'bg-brand-green/20 text-brand-green border-brand-green/30' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'follow_up', label: 'Follow Up', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'converted', label: 'Converted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { value: 'closed', label: 'Closed', color: 'bg-white/10 text-white/40 border-white/10' },
  ];

  if (loading) {
    return (
      <div className="space-y-8 h-full flex flex-col">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
          <div className="lg:col-span-2 bg-brand-dark border border-white/5 p-6 space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center pb-6 border-b border-white/5">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          <div className="bg-brand-dark border border-white/5 p-8 space-y-8">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Inquiries</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Manage Incoming Leads & Consultations ({inquiries.length} Total)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-brand-dark border border-white/5 pl-10 pr-4 py-2 text-xs uppercase tracking-widest focus:border-brand-green outline-none w-64 text-white"
            />
          </div>

          <div className="flex items-center gap-2 bg-brand-dark border border-white/5 p-1">
            <Filter className="w-3.5 h-3.5 ml-2 text-white/30" />
            {['all', 'new', 'contacted', 'follow_up', 'converted'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all",
                  filterStatus === status 
                    ? "bg-brand-green text-brand-charcoal" 
                    : "text-white/40 hover:text-white"
                )}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden min-h-[500px]">
        {/* Table List */}
        <div className="lg:col-span-2 bg-brand-dark border border-white/5 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-white/30">
                <th className="p-4">Lead</th>
                <th className="p-4">Interest</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-white/20 uppercase tracking-widest font-black">
                    No inquiries found
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <tr 
                    key={inquiry.id}
                    onClick={() => setSelectedInquiry(inquiry)}
                    className={cn(
                      "hover:bg-white/[0.02] cursor-pointer transition-colors group",
                      selectedInquiry?.id === inquiry.id && "bg-white/[0.04]"
                    )}
                  >
                    <td className="p-4">
                      <div className="font-bold">{inquiry.name}</div>
                      <div className="text-[10px] text-white/40">{inquiry.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-green">
                        {inquiry.interestedIn}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border",
                        inquiry.status === 'new' && "bg-brand-green/10 text-brand-green border-brand-green/20",
                        inquiry.status === 'contacted' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                        inquiry.status === 'follow_up' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                        inquiry.status === 'converted' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        inquiry.status === 'closed' && "bg-white/5 text-white/30 border-white/10"
                      )}>
                        {inquiry.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-white/40">
                      {inquiry.createdAt?.toDate 
                        ? format(inquiry.createdAt.toDate(), 'dd MMM, yyyy')
                        : 'Recent'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenDelete(inquiry)}
                          className="p-1.5 bg-white/5 hover:bg-red-600 hover:text-white text-white/50 transition-all rounded"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Details Area */}
        <div className="bg-brand-dark border border-white/5 overflow-auto">
          <AnimatePresence mode="wait">
            {selectedInquiry ? (
              <motion.div
                key={selectedInquiry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold uppercase italic">Lead Details</h3>
                  <button onClick={() => setSelectedInquiry(null)} className="text-white/20 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">Name</label>
                    <div className="text-lg font-bold text-white">{selectedInquiry.name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">Phone</label>
                      <div className="text-sm font-bold text-white">{selectedInquiry.phone}</div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">Interest</label>
                      <div className="text-sm font-bold text-brand-green">{selectedInquiry.interestedIn}</div>
                    </div>
                  </div>

                  {selectedInquiry.email && (
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">Email</label>
                      <div className="text-sm font-bold text-white/80">{selectedInquiry.email}</div>
                    </div>
                  )}

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">Message</label>
                    <div className="text-xs text-white/70 leading-relaxed bg-brand-charcoal p-4 border border-white/5 italic">
                      &quot;{selectedInquiry.message}&quot;
                    </div>
                  </div>

                  {/* Quick Connect */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block">Quick Connect</label>
                    <div className="grid grid-cols-2 gap-3">
                      <a 
                        href={`tel:${selectedInquiry.phone}`}
                        className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-brand-green hover:text-brand-charcoal transition-all text-[10px] font-black uppercase tracking-widest text-white"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                      <a 
                        href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-[#25D366] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest text-white"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Status Management */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block">
                      Change Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleUpdateStatus(selectedInquiry.id!, opt.value)}
                          className={cn(
                            "py-2.5 px-3 text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-between",
                            selectedInquiry.status === opt.value
                              ? opt.color + " shadow-md"
                              : "border-white/5 text-white/40 hover:border-white/20 hover:text-white bg-white/[0.02]"
                          )}
                        >
                          <span>{opt.label}</span>
                          {selectedInquiry.status === opt.value && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delete Inquiry Button */}
                  <div className="pt-6 border-t border-white/5">
                    <button 
                      onClick={() => handleOpenDelete(selectedInquiry)}
                      className="w-full py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-red-500/20 hover:border-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Inquiry
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center opacity-20 min-h-[400px]">
                <MessageSquare className="w-12 h-12 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Select an inquiry to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Alert Dialog for Deleting Inquiry */}
      <CustomAlertDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this inquiry?"
        description={`Are you sure you want to permanently remove the inquiry from "${inquiryToDeleteName}"? This action cannot be undone.`}
        confirmText="Yes, Delete Inquiry"
        cancelText="Cancel"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}

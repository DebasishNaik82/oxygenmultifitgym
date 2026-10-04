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
  MoreVertical, 
  Phone, 
  MessageCircle, 
  MessageSquare,
  Trash2, 
  ExternalLink,
  ChevronRight,
  X,
  AlertTriangle,
  Loader2,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
        let local: Inquiry[] = [];
        try {
          local = JSON.parse(localStorage.getItem('local_inquiries') || '[]');
        } catch (e) {
          // ignore
        }
        const existingIds = new Set(docs.map(d => d.id));
        const merged = [...docs, ...local.filter(l => !existingIds.has(l.id))];
        setInquiries(merged);
        setLoading(false);
      },
      (err) => {
        console.warn('Firestore inquiries listener error (loading local):', err?.message);
        try {
          const local = JSON.parse(localStorage.getItem('local_inquiries') || '[]');
          setInquiries(local);
        } catch (e) {
          // ignore
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inquiry.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, status: InquiryStatus) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), {
        status,
        updatedAt: serverTimestamp()
      });
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleAddNote = async (id: string, notes: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), {
        notes,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      setDeleteConfirm(null);
      setSelectedInquiry(null);
    } catch (err) {
      console.error("Error deleting inquiry:", err);
    }
  };

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
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Manage Leads & Communication</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text"
              placeholder="Search name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-brand-dark border border-white/5 pl-10 pr-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-brand-green transition-colors w-full md:w-64"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-brand-dark border border-white/5 pl-10 pr-10 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-brand-green transition-colors appearance-none"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="follow_up">Follow Up</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        {/* Table Area */}
        <div className="lg:col-span-2 overflow-auto bg-brand-dark border border-white/5">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 sticky top-0 z-10">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/50">Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/50">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/50">Interest</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/50 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-white/30 text-xs italic">No inquiries found matching your filters</td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <tr 
                    key={inquiry.id} 
                    onClick={() => setSelectedInquiry(inquiry)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedInquiry?.id === inquiry.id ? "bg-brand-green/10 border-l-2 border-l-brand-green" : "hover:bg-white/[0.02]"
                    )}
                  >
                    <td className="px-6 py-6">
                      <div className="text-sm font-bold">{inquiry.name}</div>
                      <div className="text-xs text-white/40 mt-0.5">{inquiry.phone}</div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={cn(
                        "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded",
                        inquiry.status === 'new' ? "bg-brand-green text-brand-charcoal" : 
                        inquiry.status === 'converted' ? "bg-blue-500 text-white" :
                        "bg-white/10 text-white/60"
                      )}>
                        {inquiry.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">{inquiry.interestedIn}</div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <ChevronRight className="w-4 h-4 ml-auto text-white/10" />
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
                className="p-8 space-y-10"
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
                    <div className="text-lg font-bold">{selectedInquiry.name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">Phone</label>
                      <div className="text-sm font-bold">{selectedInquiry.phone}</div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">Interest</label>
                      <div className="text-sm font-bold text-brand-green">{selectedInquiry.interestedIn}</div>
                    </div>
                  </div>

                  {selectedInquiry.email && (
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">Email</label>
                      <div className="text-sm font-bold">{selectedInquiry.email}</div>
                    </div>
                  )}

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">Message</label>
                    <div className="text-xs text-white/60 leading-relaxed bg-brand-charcoal p-4 border border-white/5 italic">
                      &quot;{selectedInquiry.message}&quot;
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block">Quick Connect</label>
                    <div className="grid grid-cols-2 gap-3">
                      <a 
                        href={`tel:${selectedInquiry.phone}`}
                        className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-brand-green hover:text-brand-charcoal transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                      <a 
                        href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-[#25D366] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block">Status Management</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['new', 'contacted', 'follow_up', 'converted', 'closed'].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleUpdateStatus(selectedInquiry.id!, s as InquiryStatus)}
                          className={cn(
                            "py-2 text-[8px] font-black uppercase tracking-widest border transition-all",
                            selectedInquiry.status === s 
                              ? "bg-brand-green text-brand-charcoal border-brand-green" 
                              : "border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                          )}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <button 
                      onClick={() => setDeleteConfirm(selectedInquiry.id!)}
                      className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      <Trash2 className="w-3 h-3" /> Delete Inquiry
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center opacity-20">
                <MessageSquare className="w-12 h-12 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Select an inquiry to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-charcoal/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-sm w-full bg-brand-dark border border-white/10 p-10 text-center space-y-8 shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase italic">Delete this inquiry?</h3>
                <p className="text-white/50 text-sm">This action cannot be undone. All data for this lead will be lost.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-grow py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-grow py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

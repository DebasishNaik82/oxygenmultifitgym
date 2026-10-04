'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  X, 
  Loader2, 
  Tag, 
  Sparkles 
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
import { GymService } from '@/types';
import { useToast } from '@/components/ui/toast-provider';
import CustomAlertDialog from '@/components/ui/custom-dialog';

interface ExtendedService extends GymService {
  tag?: string;
  duration?: string;
}

const defaultServices: ExtendedService[] = [
  {
    id: 'srv-1',
    name: 'Tactical Strength',
    description: 'Precision weight training focused on functional power and structural integrity.',
    tag: 'Strength',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'srv-2',
    name: 'Metabolic Reset',
    description: 'High-intensity conditioning designed to shift your body composition rapidly.',
    tag: 'Fat Loss',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'srv-3',
    name: 'Hypertrophy Axis',
    description: 'Scientific muscle building protocols for specific physique optimization.',
    tag: 'Bodybuilding',
    active: true,
    displayOrder: 3,
  },
  {
    id: 'srv-4',
    name: 'Elite 1-on-1 Coaching',
    description: 'Direct access to expert methodology and personalized performance strategy.',
    tag: 'Personal Training',
    active: true,
    displayOrder: 4,
  },
  {
    id: 'srv-5',
    name: 'Cardio & Stamina Blast',
    description: 'Endurance development conditioning to boost lung capacity and VO2 max.',
    tag: 'Cardio',
    active: true,
    displayOrder: 5,
  },
  {
    id: 'srv-6',
    name: 'Nutrition & Diet Blueprint',
    description: 'Custom macro calculation, grocery blueprints, and clean dietary coaching.',
    tag: 'Nutrition',
    active: true,
    displayOrder: 6,
  },
];

export default function AdminServices() {
  const [services, setServices] = useState<ExtendedService[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<ExtendedService> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ExtendedService | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const fetchServices = useCallback(async () => {
    try {
      const q = query(collection(db, 'services'), orderBy('displayOrder', 'asc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ExtendedService));

      let local: ExtendedService[] = [];
      try {
        local = JSON.parse(localStorage.getItem('local_services') || '[]');
      } catch (e) {
        // ignore
      }

      if (items.length === 0 && local.length === 0) {
        setServices(defaultServices);
      } else {
        const map = new Map<string, ExtendedService>();
        defaultServices.forEach((s) => map.set(s.id!, s));
        local.forEach((s) => map.set(s.id!, s));
        items.forEach((s) => map.set(s.id!, s));
        setServices(Array.from(map.values()));
      }
    } catch (err: any) {
      console.warn('Firestore services fetch note:', err?.message);
      try {
        const local = JSON.parse(localStorage.getItem('local_services') || '[]');
        setServices(local.length > 0 ? local : defaultServices);
      } catch (e) {
        setServices(defaultServices);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  // Add
  const handleOpenAdd = () => {
    setCurrentService({
      name: '',
      description: '',
      tag: 'Strength',
      active: true,
      displayOrder: services.length + 1,
    });
    setIsModalOpen(true);
  };

  // Edit
  const handleOpenEdit = (srv: ExtendedService) => {
    setCurrentService({ ...srv });
    setIsModalOpen(true);
  };

  // Save
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService?.name?.trim() || !currentService?.description?.trim()) {
      toast.warning('Program name and description are required.');
      return;
    }

    setIsSaving(true);
    const isEdit = Boolean(currentService.id && !currentService.id.startsWith('srv-'));

    try {
      if (isEdit && currentService.id) {
        const srvRef = doc(db, 'services', currentService.id);
        await updateDoc(srvRef, {
          name: currentService.name.trim(),
          description: currentService.description.trim(),
          tag: currentService.tag?.trim() || 'General',
          active: currentService.active ?? true,
          updatedAt: serverTimestamp(),
        });

        setServices((prev) =>
          prev.map((s) =>
            s.id === currentService.id ? ({ ...s, ...currentService } as ExtendedService) : s
          )
        );
        toast.success(`Training program "${currentService.name}" updated!`);
      } else {
        const newRecord: ExtendedService = {
          name: currentService.name.trim(),
          description: currentService.description.trim(),
          tag: currentService.tag?.trim() || 'General',
          active: currentService.active ?? true,
          displayOrder: currentService.displayOrder || services.length + 1,
        };

        try {
          const docRef = await addDoc(collection(db, 'services'), {
            ...newRecord,
            createdAt: serverTimestamp(),
          });
          newRecord.id = docRef.id;
        } catch (dbErr) {
          newRecord.id = `local-srv-${Date.now()}`;
          const local = JSON.parse(localStorage.getItem('local_services') || '[]');
          localStorage.setItem('local_services', JSON.stringify([newRecord, ...local]));
        }

        setServices((prev) => [...prev, newRecord]);
        toast.success(`New program "${newRecord.name}" added successfully!`);
      }

      setIsModalOpen(false);
      setCurrentService(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save service.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDeleteClick = (srv: ExtendedService) => {
    setServiceToDelete(srv);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);

    try {
      if (serviceToDelete.id && !serviceToDelete.id.startsWith('srv-') && !serviceToDelete.id.startsWith('local-srv-')) {
        await deleteDoc(doc(db, 'services', serviceToDelete.id));
      } else if (serviceToDelete.id?.startsWith('local-srv-')) {
        const local = JSON.parse(localStorage.getItem('local_services') || '[]');
        const updated = local.filter((s: ExtendedService) => s.id !== serviceToDelete.id);
        localStorage.setItem('local_services', JSON.stringify(updated));
      }

      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
      toast.success(`Program "${serviceToDelete.name}" deleted.`);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete service.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle active
  const handleToggleActive = async (srv: ExtendedService) => {
    const updatedStatus = !srv.active;
    try {
      if (srv.id && !srv.id.startsWith('srv-') && !srv.id.startsWith('local-srv-')) {
        await updateDoc(doc(db, 'services', srv.id), {
          active: updatedStatus,
          updatedAt: serverTimestamp(),
        });
      }
      setServices((prev) =>
        prev.map((s) => (s.id === srv.id ? { ...s, active: updatedStatus } : s))
      );
      toast.info(updatedStatus ? `Program "${srv.name}" is now active.` : `Program "${srv.name}" hidden.`);
    } catch (err: any) {
      setServices((prev) =>
        prev.map((s) => (s.id === srv.id ? { ...s, active: updatedStatus } : s))
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-green text-[10px] font-black uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5" /> Programs & Coaching
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">
            Training <span className="text-brand-green">Services</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Manage workouts, fitness packages, and specialized coaching modules
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-brand-green hover:bg-white text-brand-charcoal font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg shadow-brand-green/10"
        >
          <Plus className="w-4 h-4" /> Add Program
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Loading training services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-brand-dark p-20 border border-white/5 text-center space-y-4">
          <Activity className="w-16 h-16 text-white/5 mx-auto" />
          <h3 className="text-xl font-bold uppercase italic">No services listed</h3>
          <p className="text-white/40 text-xs uppercase tracking-widest">
            Click &quot;Add Program&quot; to configure your workout offerings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className={`p-6 bg-brand-dark border transition-all flex flex-col justify-between relative ${
                srv.active ? 'border-white/10 hover:border-brand-green/50' : 'border-white/5 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 bg-brand-green/10 text-brand-green border border-brand-green/20 text-[10px] font-black uppercase tracking-widest">
                    {srv.tag || 'Training'}
                  </span>
                  <button
                    onClick={() => handleToggleActive(srv)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                      srv.active
                        ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                        : 'bg-white/10 text-white/50 border border-white/10'
                    }`}
                  >
                    {srv.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {srv.active ? 'Active' : 'Hidden'}
                  </button>
                </div>

                <h3 className="text-xl font-syne font-bold uppercase italic text-white mb-2">
                  {srv.name}
                </h3>
                <p className="text-xs text-white/60 font-jakarta leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(srv)}
                  className="p-2 bg-white/5 hover:bg-brand-green hover:text-brand-charcoal text-white/70 transition-all rounded"
                  title="Edit service"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(srv)}
                  className="p-2 bg-white/5 hover:bg-red-600 hover:text-white text-white/70 transition-all rounded"
                  title="Delete service"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && currentService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !isSaving && setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-brand-charcoal border border-white/10 p-6 md:p-8 shadow-2xl z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-brand-green text-[10px] font-black uppercase tracking-widest block mb-1">
                  {currentService.id ? 'Modify Program' : 'New Program'}
                </span>
                <h3 className="text-2xl font-syne font-bold uppercase italic text-white">
                  {currentService.id ? 'Edit Service' : 'Add Training Program'}
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

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Program Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tactical Strength"
                  value={currentService.name || ''}
                  onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Category Tag *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Strength, Fat Loss, Personal Training"
                  value={currentService.tag || ''}
                  onChange={(e) => setCurrentService({ ...currentService, tag: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain workout focus, targeted outcomes, and training methodology..."
                  value={currentService.description || ''}
                  onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 p-3 text-white text-xs outline-none focus:border-brand-green resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="srvActiveCheckbox"
                  checked={currentService.active ?? true}
                  onChange={(e) => setCurrentService({ ...currentService, active: e.target.checked })}
                  className="w-4 h-4 accent-brand-green cursor-pointer"
                />
                <label htmlFor="srvActiveCheckbox" className="text-xs text-white/80 cursor-pointer font-bold">
                  Active (Visible on Website)
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
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-brand-green hover:bg-white text-brand-charcoal text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {currentService.id ? 'Save Changes' : 'Create Program'}
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
        title="Delete Training Program?"
        description={`Are you sure you want to remove "${serviceToDelete?.name}"?`}
        confirmText="Yes, Delete Program"
        cancelText="Cancel"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  X, 
  Loader2, 
  Dumbbell, 
  Heart, 
  Zap, 
  Shield, 
  Waves, 
  Layout,
  Check
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
import { Facility } from '@/types';
import { useToast } from '@/components/ui/toast-provider';
import CustomAlertDialog from '@/components/ui/custom-dialog';

interface ExtendedFacility extends Facility {
  iconName?: string;
}

const defaultFacilities: ExtendedFacility[] = [
  {
    id: 'fac-1',
    name: 'Strength Axis',
    description: 'Precision-engineered machines for maximum mechanical tension and hypertrophy growth.',
    iconName: 'Dumbbell',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'fac-2',
    name: 'Cardio Lab',
    description: 'Elite biometric tracking on industry-leading endurance and HIIT systems.',
    iconName: 'Heart',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'fac-3',
    name: 'Free Range Iron Zone',
    description: 'Heavy-duty steel, Olympic platforms, and massive floor space for unrestricted movement.',
    iconName: 'Zap',
    active: true,
    displayOrder: 3,
  },
  {
    id: 'fac-4',
    name: 'Tactical Conditioning Floor',
    description: 'Spacious turf and functional performance area for dynamic athletic agility.',
    iconName: 'Layout',
    active: true,
    displayOrder: 4,
  },
  {
    id: 'fac-5',
    name: 'Secure Vault & Locker Room',
    description: 'Ultra-hygienic storage, changing zones, and secure lockers for your personal assets.',
    iconName: 'Shield',
    active: true,
    displayOrder: 5,
  },
  {
    id: 'fac-6',
    name: 'Steam & Recovery Zone',
    description: 'Therapeutic steam amenities, relaxation areas, and sanitized wellness rooms.',
    iconName: 'Waves',
    active: true,
    displayOrder: 6,
  },
];

const iconMap: Record<string, any> = {
  Dumbbell,
  Heart,
  Zap,
  Layout,
  Shield,
  Waves,
};

export default function AdminFacilities() {
  const [facilities, setFacilities] = useState<ExtendedFacility[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFacility, setCurrentFacility] = useState<Partial<ExtendedFacility> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<ExtendedFacility | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const fetchFacilities = useCallback(async () => {
    try {
      const q = query(collection(db, 'facilities'), orderBy('displayOrder', 'asc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ExtendedFacility));

      let local: ExtendedFacility[] = [];
      try {
        local = JSON.parse(localStorage.getItem('local_facilities') || '[]');
      } catch (e) {
        // ignore
      }

      if (items.length === 0 && local.length === 0) {
        setFacilities(defaultFacilities);
      } else {
        const map = new Map<string, ExtendedFacility>();
        defaultFacilities.forEach((f) => map.set(f.id!, f));
        local.forEach((f) => map.set(f.id!, f));
        items.forEach((f) => map.set(f.id!, f));
        setFacilities(Array.from(map.values()));
      }
    } catch (err: any) {
      console.warn('Firestore facilities fetch note:', err?.message);
      try {
        const local = JSON.parse(localStorage.getItem('local_facilities') || '[]');
        setFacilities(local.length > 0 ? local : defaultFacilities);
      } catch (e) {
        setFacilities(defaultFacilities);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFacilities();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchFacilities]);

  // Open Add
  const handleOpenAdd = () => {
    setCurrentFacility({
      name: '',
      description: '',
      iconName: 'Dumbbell',
      active: true,
      displayOrder: facilities.length + 1,
    });
    setIsModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (fac: ExtendedFacility) => {
    setCurrentFacility({ ...fac });
    setIsModalOpen(true);
  };

  // Save
  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFacility?.name?.trim() || !currentFacility?.description?.trim()) {
      toast.warning('Name and description are required.');
      return;
    }

    setIsSaving(true);
    const isEdit = Boolean(currentFacility.id && !currentFacility.id.startsWith('fac-'));

    try {
      if (isEdit && currentFacility.id) {
        const facRef = doc(db, 'facilities', currentFacility.id);
        await updateDoc(facRef, {
          name: currentFacility.name.trim(),
          description: currentFacility.description.trim(),
          iconName: currentFacility.iconName || 'Dumbbell',
          active: currentFacility.active ?? true,
          updatedAt: serverTimestamp(),
        });

        setFacilities((prev) =>
          prev.map((f) =>
            f.id === currentFacility.id ? ({ ...f, ...currentFacility } as ExtendedFacility) : f
          )
        );
        toast.success(`Facility "${currentFacility.name}" updated successfully!`);
      } else {
        const newRecord: ExtendedFacility = {
          name: currentFacility.name.trim(),
          description: currentFacility.description.trim(),
          iconName: currentFacility.iconName || 'Dumbbell',
          active: currentFacility.active ?? true,
          displayOrder: currentFacility.displayOrder || facilities.length + 1,
        };

        try {
          const docRef = await addDoc(collection(db, 'facilities'), {
            ...newRecord,
            createdAt: serverTimestamp(),
          });
          newRecord.id = docRef.id;
        } catch (dbErr) {
          newRecord.id = `local-fac-${Date.now()}`;
          const local = JSON.parse(localStorage.getItem('local_facilities') || '[]');
          localStorage.setItem('local_facilities', JSON.stringify([newRecord, ...local]));
        }

        setFacilities((prev) => [...prev, newRecord]);
        toast.success(`Facility "${newRecord.name}" added successfully!`);
      }

      setIsModalOpen(false);
      setCurrentFacility(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save facility.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDeleteClick = (fac: ExtendedFacility) => {
    setFacilityToDelete(fac);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!facilityToDelete) return;
    setIsDeleting(true);

    try {
      if (facilityToDelete.id && !facilityToDelete.id.startsWith('fac-') && !facilityToDelete.id.startsWith('local-fac-')) {
        await deleteDoc(doc(db, 'facilities', facilityToDelete.id));
      } else if (facilityToDelete.id?.startsWith('local-fac-')) {
        const local = JSON.parse(localStorage.getItem('local_facilities') || '[]');
        const updated = local.filter((f: ExtendedFacility) => f.id !== facilityToDelete.id);
        localStorage.setItem('local_facilities', JSON.stringify(updated));
      }

      setFacilities((prev) => prev.filter((f) => f.id !== facilityToDelete.id));
      toast.success(`Facility "${facilityToDelete.name}" deleted.`);
      setDeleteDialogOpen(false);
      setFacilityToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete facility.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle active
  const handleToggleActive = async (fac: ExtendedFacility) => {
    const updatedStatus = !fac.active;
    try {
      if (fac.id && !fac.id.startsWith('fac-') && !fac.id.startsWith('local-fac-')) {
        await updateDoc(doc(db, 'facilities', fac.id), {
          active: updatedStatus,
          updatedAt: serverTimestamp(),
        });
      }
      setFacilities((prev) =>
        prev.map((f) => (f.id === fac.id ? { ...f, active: updatedStatus } : f))
      );
      toast.info(updatedStatus ? `Facility "${fac.name}" is now active.` : `Facility "${fac.name}" hidden.`);
    } catch (err: any) {
      setFacilities((prev) =>
        prev.map((f) => (f.id === fac.id ? { ...f, active: updatedStatus } : f))
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-green text-[10px] font-black uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" /> Gym Amenities & Equipment
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">
            Gym <span className="text-brand-green">Facilities</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Manage workout zones, training areas, and athlete amenities
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-brand-green hover:bg-white text-brand-charcoal font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg shadow-brand-green/10"
        >
          <Plus className="w-4 h-4" /> Add Facility
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Loading facilities...</p>
        </div>
      ) : facilities.length === 0 ? (
        <div className="bg-brand-dark p-20 border border-white/5 text-center space-y-4">
          <Layers className="w-16 h-16 text-white/5 mx-auto" />
          <h3 className="text-xl font-bold uppercase italic">No facilities added</h3>
          <p className="text-white/40 text-xs uppercase tracking-widest">
            Click &quot;Add Facility&quot; to configure your gym areas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => {
            const IconComponent = iconMap[fac.iconName || 'Dumbbell'] || Dumbbell;
            return (
              <div
                key={fac.id}
                className={`p-6 bg-brand-dark border transition-all flex flex-col justify-between relative ${
                  fac.active ? 'border-white/10 hover:border-brand-green/50' : 'border-white/5 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-brand-green">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => handleToggleActive(fac)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                        fac.active
                          ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                          : 'bg-white/10 text-white/50 border border-white/10'
                      }`}
                    >
                      {fac.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {fac.active ? 'Active' : 'Hidden'}
                    </button>
                  </div>

                  <h3 className="text-xl font-syne font-bold uppercase italic text-white mb-2">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-white/60 font-jakarta leading-relaxed">
                    {fac.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(fac)}
                    className="p-2 bg-white/5 hover:bg-brand-green hover:text-brand-charcoal text-white/70 transition-all rounded"
                    title="Edit facility"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(fac)}
                    className="p-2 bg-white/5 hover:bg-red-600 hover:text-white text-white/70 transition-all rounded"
                    title="Delete facility"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && currentFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !isSaving && setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-brand-charcoal border border-white/10 p-6 md:p-8 shadow-2xl z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-brand-green text-[10px] font-black uppercase tracking-widest block mb-1">
                  {currentFacility.id ? 'Modify Facility' : 'Create New Area'}
                </span>
                <h3 className="text-2xl font-syne font-bold uppercase italic text-white">
                  {currentFacility.id ? 'Edit Facility' : 'Add Gym Facility'}
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

            <form onSubmit={handleSaveFacility} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Strength Axis"
                  value={currentFacility.name || ''}
                  onChange={(e) => setCurrentFacility({ ...currentFacility, name: e.target.value })}
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
                  placeholder="Describe equipment and features available in this area..."
                  value={currentFacility.description || ''}
                  onChange={(e) => setCurrentFacility({ ...currentFacility, description: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 p-3 text-white text-xs outline-none focus:border-brand-green resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-2">
                  Select Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {Object.keys(iconMap).map((iconKey) => {
                    const Icon = iconMap[iconKey];
                    const isSelected = currentFacility.iconName === iconKey;
                    return (
                      <button
                        type="button"
                        key={iconKey}
                        onClick={() => setCurrentFacility({ ...currentFacility, iconName: iconKey })}
                        className={`p-3 border flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'border-brand-green bg-brand-green/20 text-brand-green'
                            : 'border-white/10 bg-brand-dark text-white/50 hover:text-white hover:border-white/30'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[9px] font-mono">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="facActiveCheckbox"
                  checked={currentFacility.active ?? true}
                  onChange={(e) => setCurrentFacility({ ...currentFacility, active: e.target.checked })}
                  className="w-4 h-4 accent-brand-green cursor-pointer"
                />
                <label htmlFor="facActiveCheckbox" className="text-xs text-white/80 cursor-pointer font-bold">
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
                  {currentFacility.id ? 'Save Changes' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <CustomAlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Facility?"
        description={`Are you sure you want to permanently delete "${facilityToDelete?.name}"?`}
        confirmText="Yes, Delete Facility"
        cancelText="Cancel"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}

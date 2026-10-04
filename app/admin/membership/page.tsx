'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Loader2, 
  Sparkles,
  DollarSign
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
import { MembershipPlan } from '@/types';
import { useToast } from '@/components/ui/toast-provider';
import CustomAlertDialog from '@/components/ui/custom-dialog';

interface ExtendedPlan extends MembershipPlan {
  originalPrice?: string;
  badge?: string;
  highlight?: boolean;
}

const defaultPlans: ExtendedPlan[] = [
  {
    id: 'plan-1',
    name: 'Foundation',
    duration: '1 Month Access',
    price: '₹1,499',
    originalPrice: '₹1,999',
    badge: 'Flexible',
    description: 'Ideal for beginners kickstarting their fitness journey with no long-term lock-in.',
    features: [
      'Full gym floor & heavy iron zone access',
      'Advanced cardio theater systems',
      'Locker room & changing facilities',
      'Free general trainer floor guidance',
      'Initial fitness baseline assessment',
    ],
    active: true,
    displayOrder: 1,
    highlight: false,
  },
  {
    id: 'plan-2',
    name: 'Performance',
    duration: '12 Months Access',
    price: '₹11,999',
    originalPrice: '₹18,000',
    badge: 'MOST POPULAR • SAVE 35%',
    description: 'Our flagship transformation package for serious fitness and athletic progression.',
    features: [
      'Everything in Foundation included',
      'Personalized workout & nutritional blueprint',
      'Monthly InBody biometric & BMI analysis',
      'Steam bath & recovery amenities',
      '2 Complimentary 1-on-1 Personal Training sessions',
      'Priority access to special gym workshops',
      'Guest passes (2 per quarter)',
    ],
    active: true,
    displayOrder: 2,
    highlight: true,
  },
  {
    id: 'plan-3',
    name: 'Tactical',
    duration: '3 Months Cycle',
    price: '₹3,999',
    originalPrice: '₹4,999',
    badge: 'Transformation',
    description: 'The focused 90-day transformation block to build sustainable strength and muscle.',
    features: [
      'Everything in Foundation included',
      'Body composition goal roadmap',
      'Strength & conditioning protocol',
      'Custom macro & diet suggestion sheet',
      'Weekly progress check-ins',
    ],
    active: true,
    displayOrder: 3,
    highlight: false,
  },
];

export default function AdminMembership() {
  const [plans, setPlans] = useState<ExtendedPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<ExtendedPlan> | null>(null);
  const [featuresText, setFeaturesText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<ExtendedPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const fetchPlans = useCallback(async () => {
    try {
      const q = query(collection(db, 'plans'), orderBy('displayOrder', 'asc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ExtendedPlan));

      let local: ExtendedPlan[] = [];
      try {
        local = JSON.parse(localStorage.getItem('local_plans') || '[]');
      } catch (e) {
        // ignore
      }

      if (items.length === 0 && local.length === 0) {
        setPlans(defaultPlans);
      } else {
        const map = new Map<string, ExtendedPlan>();
        defaultPlans.forEach((p) => map.set(p.id!, p));
        local.forEach((p) => map.set(p.id!, p));
        items.forEach((p) => map.set(p.id!, p));
        setPlans(Array.from(map.values()));
      }
    } catch (err: any) {
      console.warn('Firestore plans fetch note:', err?.message);
      try {
        const local = JSON.parse(localStorage.getItem('local_plans') || '[]');
        setPlans(local.length > 0 ? local : defaultPlans);
      } catch (e) {
        setPlans(defaultPlans);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlans();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchPlans]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setCurrentPlan({
      name: '',
      duration: '1 Month',
      price: '₹1,500',
      originalPrice: '',
      badge: '',
      description: '',
      features: [],
      active: true,
      displayOrder: plans.length + 1,
      highlight: false,
    });
    setFeaturesText('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (plan: ExtendedPlan) => {
    setCurrentPlan({ ...plan });
    setFeaturesText((plan.features || []).join('\n'));
    setIsModalOpen(true);
  };

  // Save Plan
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan?.name?.trim() || !currentPlan?.price?.trim()) {
      toast.warning('Plan name and price are required.');
      return;
    }

    setIsSaving(true);
    const parsedFeatures = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const isEdit = Boolean(currentPlan.id && !currentPlan.id.startsWith('plan-'));

    try {
      if (isEdit && currentPlan.id) {
        const planRef = doc(db, 'plans', currentPlan.id);
        await updateDoc(planRef, {
          name: currentPlan.name.trim(),
          duration: currentPlan.duration?.trim() || '1 Month',
          price: currentPlan.price.trim(),
          originalPrice: currentPlan.originalPrice?.trim() || '',
          badge: currentPlan.badge?.trim() || '',
          description: currentPlan.description?.trim() || '',
          features: parsedFeatures,
          active: currentPlan.active ?? true,
          highlight: Boolean(currentPlan.highlight),
          updatedAt: serverTimestamp(),
        });

        setPlans((prev) =>
          prev.map((p) =>
            p.id === currentPlan.id
              ? ({ ...p, ...currentPlan, features: parsedFeatures } as ExtendedPlan)
              : p
          )
        );
        toast.success(`Membership plan "${currentPlan.name}" updated successfully!`);
      } else {
        const newRecord: ExtendedPlan = {
          name: currentPlan.name.trim(),
          duration: currentPlan.duration?.trim() || '1 Month',
          price: currentPlan.price.trim(),
          originalPrice: currentPlan.originalPrice?.trim() || '',
          badge: currentPlan.badge?.trim() || '',
          description: currentPlan.description?.trim() || '',
          features: parsedFeatures,
          active: currentPlan.active ?? true,
          displayOrder: currentPlan.displayOrder || plans.length + 1,
          highlight: Boolean(currentPlan.highlight),
        };

        try {
          const docRef = await addDoc(collection(db, 'plans'), {
            ...newRecord,
            createdAt: serverTimestamp(),
          });
          newRecord.id = docRef.id;
        } catch (dbErr) {
          newRecord.id = `local-plan-${Date.now()}`;
          const local = JSON.parse(localStorage.getItem('local_plans') || '[]');
          localStorage.setItem('local_plans', JSON.stringify([newRecord, ...local]));
        }

        setPlans((prev) => [...prev, newRecord]);
        toast.success(`New plan "${newRecord.name}" added successfully!`);
      }

      setIsModalOpen(false);
      setCurrentPlan(null);
    } catch (err: any) {
      console.error('Error saving plan:', err);
      toast.error(err?.message || 'Failed to save plan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDeleteClick = (plan: ExtendedPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);

    try {
      if (planToDelete.id && !planToDelete.id.startsWith('plan-') && !planToDelete.id.startsWith('local-plan-')) {
        await deleteDoc(doc(db, 'plans', planToDelete.id));
      } else if (planToDelete.id?.startsWith('local-plan-')) {
        const local = JSON.parse(localStorage.getItem('local_plans') || '[]');
        const updated = local.filter((p: ExtendedPlan) => p.id !== planToDelete.id);
        localStorage.setItem('local_plans', JSON.stringify(updated));
      }

      setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      toast.success(`Plan "${planToDelete.name}" removed successfully.`);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err?.message || 'Could not delete plan.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Active status
  const handleToggleActive = async (plan: ExtendedPlan) => {
    const updatedStatus = !plan.active;
    try {
      if (plan.id && !plan.id.startsWith('plan-') && !plan.id.startsWith('local-plan-')) {
        await updateDoc(doc(db, 'plans', plan.id), {
          active: updatedStatus,
          updatedAt: serverTimestamp(),
        });
      }
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, active: updatedStatus } : p))
      );
      toast.info(updatedStatus ? `Plan "${plan.name}" is now active.` : `Plan "${plan.name}" deactivated.`);
    } catch (err: any) {
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, active: updatedStatus } : p))
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-green text-[10px] font-black uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" /> Pricing Management
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">
            Membership <span className="text-brand-green">Plans</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Configure rates, packages, and membership perks
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-brand-green hover:bg-white text-brand-charcoal font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg shadow-brand-green/10"
        >
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Loading membership packages...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-brand-dark p-20 border border-white/5 text-center space-y-4">
          <DollarSign className="w-16 h-16 text-white/5 mx-auto" />
          <h3 className="text-xl font-bold uppercase italic">No plans found</h3>
          <p className="text-white/40 text-xs uppercase tracking-widest">
            Click &quot;Add Plan&quot; to configure your first gym membership package.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 bg-brand-dark border transition-all flex flex-col justify-between relative ${
                plan.highlight
                  ? 'border-brand-green shadow-xl shadow-brand-green/5'
                  : 'border-white/5 hover:border-white/20'
              } ${!plan.active ? 'opacity-60' : ''}`}
            >
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-0.5 bg-brand-green/10 text-brand-green border border-brand-green/30 text-[9px] font-black uppercase tracking-widest">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="space-y-1 pr-12">
                  <h3 className="text-xl font-syne font-bold uppercase italic text-white">
                    {plan.name}
                  </h3>
                  <span className="text-xs text-brand-green font-semibold uppercase tracking-wider block">
                    {plan.duration}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black italic text-white">{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="text-xs text-white/40 line-through">{plan.originalPrice}</span>
                  )}
                </div>

                {plan.description && (
                  <p className="text-xs text-white/60 font-jakarta mt-3 leading-relaxed">
                    {plan.description}
                  </p>
                )}

                <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">
                    Included Features:
                  </span>
                  {(plan.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-white/80">
                      <Check className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(plan)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                    plan.active
                      ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                      : 'bg-white/10 text-white/50 border border-white/10'
                  }`}
                >
                  {plan.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {plan.active ? 'Active' : 'Inactive'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-2 bg-white/5 hover:bg-brand-green hover:text-brand-charcoal text-white/70 transition-all rounded"
                    title="Edit plan"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(plan)}
                    className="p-2 bg-white/5 hover:bg-red-600 hover:text-white text-white/70 transition-all rounded"
                    title="Delete plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Edit / Add */}
      {isModalOpen && currentPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !isSaving && setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-brand-charcoal border border-white/10 p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-brand-green text-[10px] font-black uppercase tracking-widest block mb-1">
                  {currentPlan.id ? 'Modify Package' : 'Create New'}
                </span>
                <h3 className="text-2xl font-syne font-bold uppercase italic text-white">
                  {currentPlan.id ? 'Edit Plan' : 'Add Membership Plan'}
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

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Performance"
                    value={currentPlan.name || ''}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12 Months Access"
                    value={currentPlan.duration || ''}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, duration: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                    Price *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹11,999"
                    value={currentPlan.price || ''}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, price: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                    Original Price (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹18,000"
                    value={currentPlan.originalPrice || ''}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, originalPrice: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Badge / Tag (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MOST POPULAR • SAVE 35%"
                  value={currentPlan.badge || ''}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, badge: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of this package..."
                  value={currentPlan.description || ''}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, description: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 p-3 text-white text-xs outline-none focus:border-brand-green resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Perks & Features (one per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="Full gym floor access&#10;Locker room facilities&#10;Trainer floor guidance"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full bg-brand-dark border border-white/10 p-3 text-white text-xs outline-none focus:border-brand-green resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="highlightCheckbox"
                    checked={currentPlan.highlight ?? false}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, highlight: e.target.checked })}
                    className="w-4 h-4 accent-brand-green cursor-pointer"
                  />
                  <label htmlFor="highlightCheckbox" className="text-xs text-white/80 cursor-pointer font-bold">
                    Highlight / Featured Card
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="planActiveCheckbox"
                    checked={currentPlan.active ?? true}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, active: e.target.checked })}
                    className="w-4 h-4 accent-brand-green cursor-pointer"
                  />
                  <label htmlFor="planActiveCheckbox" className="text-xs text-white/80 cursor-pointer font-bold">
                    Active (Public)
                  </label>
                </div>
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
                  {currentPlan.id ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert Dialog for Deleting Plan */}
      <CustomAlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Membership Plan?"
        description={`Are you sure you want to permanently remove "${planToDelete?.name}"? Athletes will no longer see this package option.`}
        confirmText="Yes, Delete Plan"
        cancelText="Keep Plan"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}

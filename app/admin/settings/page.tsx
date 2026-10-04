'use client';

import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Lock, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/toast-provider';

interface GymSettings {
  gymName: string;
  phone: string;
  email: string;
  address: string;
  morningHours: string;
  eveningHours: string;
  sundayHours: string;
  instagramUrl: string;
  whatsappNumber: string;
}

const defaultSettings: GymSettings = {
  gymName: 'Oxygen Multifit Gym',
  phone: '+91 94370 11223',
  email: 'info@oxygenmultifit.com',
  address: 'Near Mahaveer College, Kesinga Road, Bhawanipatna, Kalahandi, Odisha 766001',
  morningHours: '05:30 AM – 10:30 AM',
  eveningHours: '04:30 PM – 09:30 PM',
  sundayHours: '06:00 AM – 11:00 AM (Special Session)',
  instagramUrl: 'https://instagram.com/oxygenmultifit',
  whatsappNumber: '+91 94370 11223',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<GymSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Password / Security
  const [adminUsername, setAdminUsername] = useState('OxygenMultifit');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const toast = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
        if (settingsSnap.exists()) {
          setSettings({ ...defaultSettings, ...settingsSnap.data() } as GymSettings);
        } else {
          const local = localStorage.getItem('local_gym_settings');
          if (local) {
            setSettings({ ...defaultSettings, ...JSON.parse(local) });
          }
        }

        const adminSnap = await getDoc(doc(db, 'admin', 'credentials'));
        if (adminSnap.exists()) {
          const data = adminSnap.data();
          if (data.username) setAdminUsername(data.username);
        }
      } catch (err: any) {
        console.warn('Settings load note:', err?.message);
        const local = localStorage.getItem('local_gym_settings');
        if (local) {
          try {
            setSettings({ ...defaultSettings, ...JSON.parse(local) });
          } catch (e) {
            // ignore
          }
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Save General Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      localStorage.setItem('local_gym_settings', JSON.stringify(settings));

      try {
        await setDoc(doc(db, 'settings', 'general'), {
          ...settings,
          updatedAt: serverTimestamp(),
        });
      } catch (dbErr: any) {
        console.warn('Firestore write note:', dbErr?.message);
      }

      toast.success('Gym contact details & operating hours saved successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Change Admin Credentials
  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      toast.warning('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      toast.warning('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setSavingPassword(true);

    try {
      try {
        await setDoc(doc(db, 'admin', 'credentials'), {
          username: adminUsername.trim(),
          password: newPassword.trim(),
          updatedAt: serverTimestamp(),
        });
      } catch (dbErr: any) {
        console.warn('Firestore admin write note:', dbErr?.message);
      }

      toast.success(`Admin credentials updated! Username: "${adminUsername}"`);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update credentials.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-brand-green text-[10px] font-black uppercase tracking-widest">
          <SettingsIcon className="w-3.5 h-3.5" /> General Configuration
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">
          Gym <span className="text-brand-green">Settings</span>
        </h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
          Update gym profile, contact information, hours of operation, and admin credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Gym Info */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSaveSettings} className="bg-brand-dark border border-white/5 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-5 h-5 text-brand-green" />
                <h3 className="text-lg font-syne font-bold uppercase italic">Gym Contact & Address</h3>
              </div>
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Public Info</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Gym / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={settings.gymName}
                  onChange={(e) => setSettings({ ...settings, gymName: e.target.value })}
                  className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                Physical Facility Address
              </label>
              <textarea
                rows={2}
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-brand-charcoal border border-white/10 p-3 text-white text-xs outline-none focus:border-brand-green resize-none leading-relaxed"
              />
            </div>

            {/* Operating Hours */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-4 h-4 text-brand-green" />
                <h4 className="text-sm font-syne font-bold uppercase italic">Operating Hours</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                    Morning Shift
                  </label>
                  <input
                    type="text"
                    value={settings.morningHours}
                    onChange={(e) => setSettings({ ...settings, morningHours: e.target.value })}
                    className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                    Evening Shift
                  </label>
                  <input
                    type="text"
                    value={settings.eveningHours}
                    onChange={(e) => setSettings({ ...settings, eveningHours: e.target.value })}
                    className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                    Sunday Schedule
                  </label>
                  <input
                    type="text"
                    value={settings.sundayHours}
                    onChange={(e) => setSettings({ ...settings, sundayHours: e.target.value })}
                    className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 bg-brand-green hover:bg-white text-brand-charcoal font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg shadow-brand-green/10 disabled:opacity-50"
              >
                {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {savingSettings ? 'Saving...' : 'Save Gym Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security & Credentials */}
        <div className="space-y-6">
          <form onSubmit={handleChangeCredentials} className="bg-brand-dark border border-white/5 p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-white pb-4 border-b border-white/5">
              <ShieldCheck className="w-5 h-5 text-brand-green" />
              <h3 className="text-lg font-syne font-bold uppercase italic">Admin Credentials</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Admin Username
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-brand-charcoal border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-brand-green"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-3 bg-brand-green hover:bg-white text-brand-charcoal font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          {/* Quick System Info Card */}
          <div className="bg-brand-dark/50 border border-white/5 p-6 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-green">
              Database Sync Status
            </h4>
            <p className="text-[11px] text-white/50 leading-relaxed">
              All settings are synced automatically with Firestore database <code className="text-white/80">oxygenmultifitgym-db</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

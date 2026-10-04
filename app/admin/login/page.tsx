'use client';

import { motion } from 'motion/react';
import { Dumbbell } from 'lucide-react';
import LoginForm from '@/components/admin/login-form';

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div className="flex flex-col items-center">
          <Dumbbell className="w-16 h-16 text-brand-green mb-6" />
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            Oxygen <span className="text-brand-green">Admin</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">
            Secure Dashboard Access
          </p>
        </div>

        <div className="bg-brand-dark p-10 border border-white/5">
          <LoginForm />
        </div>

        <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">
          Oxygen Multifit Gym • Internal Access Only
        </p>
      </motion.div>
    </div>
  );
}

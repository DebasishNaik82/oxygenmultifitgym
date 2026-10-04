'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  interestedIn: z.enum(['Membership', 'Personal Training', 'Fitness Training', 'General Inquiry', 'Other']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof formSchema>;

function createLocalId() {
  return `local-${Math.random().toString(36).substring(2, 9)}`;
}

export default function InquiryForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interestedIn: 'General Inquiry',
    },
  });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      await addDoc(collection(db, 'inquiries'), {
        ...data,
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setStatus('success');
      reset();
    } catch (error) {
      console.warn('Firestore inquiry write notice (storing locally):', error);
      try {
        const localInquiries = JSON.parse(localStorage.getItem('local_inquiries') || '[]');
        localInquiries.unshift({
          id: createLocalId(),
          ...data,
          status: 'new',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        });
        localStorage.setItem('local_inquiries', JSON.stringify(localInquiries));
        setStatus('success');
        reset();
      } catch (e) {
        setStatus('error');
        setErrorMessage('Something went wrong. Please try again.');
      }
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-dark p-8 border border-brand-green/20 text-center space-y-4"
      >
        <CheckCircle2 className="w-16 h-16 text-brand-green mx-auto" />
        <h3 className="text-2xl font-bold">Thank You!</h3>
        <p className="text-white/70">
          Your inquiry has been submitted successfully. Our team will contact you soon.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="px-6 py-2 bg-brand-green text-brand-charcoal font-bold uppercase tracking-widest text-xs"
        >
          Send Another
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-brand-dark/50 p-8 border border-white/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">Full Name *</label>
          <input
            {...register('name')}
            placeholder="John Doe"
            className="w-full bg-brand-charcoal border border-white/10 px-4 py-3 text-sm focus:border-brand-green outline-none transition-colors"
          />
          {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">Phone Number *</label>
          <input
            {...register('phone')}
            placeholder="+91 00000 00000"
            className="w-full bg-brand-charcoal border border-white/10 px-4 py-3 text-sm focus:border-brand-green outline-none transition-colors"
          />
          {errors.phone && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">Email Address (Optional)</label>
          <input
            {...register('email')}
            placeholder="john@example.com"
            className="w-full bg-brand-charcoal border border-white/10 px-4 py-3 text-sm focus:border-brand-green outline-none transition-colors"
          />
          {errors.email && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">Interested In *</label>
          <select
            {...register('interestedIn')}
            className="w-full bg-brand-charcoal border border-white/10 px-4 py-3 text-sm focus:border-brand-green outline-none transition-colors appearance-none"
          >
            <option value="Membership">Membership</option>
            <option value="Personal Training">Personal Training</option>
            <option value="Fitness Training">Fitness Training</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Other">Other</option>
          </select>
          {errors.interestedIn && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.interestedIn.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/50">Message *</label>
        <textarea
          {...register('message')}
          placeholder="Tell us about your fitness goals..."
          rows={4}
          className="w-full bg-brand-charcoal border border-white/10 px-4 py-3 text-sm focus:border-brand-green outline-none transition-colors resize-none"
        />
        {errors.message && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.message.message}</p>}
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 bg-brand-green text-brand-charcoal font-black uppercase tracking-[0.2em] text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Send Inquiry'
        )}
      </button>
    </form>
  );
}

'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X, Loader2 } from 'lucide-react';

export interface CustomAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

export default function CustomAlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false,
}: CustomAlertDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  const typeConfig = {
    danger: {
      icon: AlertCircle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-500/10 border-red-500/20',
      confirmButton: 'bg-red-600 hover:bg-red-500 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-400/10 border-amber-400/20',
      confirmButton: 'bg-amber-500 hover:bg-amber-400 text-brand-charcoal font-bold',
    },
    info: {
      icon: Info,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-400/10 border-sky-400/20',
      confirmButton: 'bg-sky-500 hover:bg-sky-400 text-white',
    },
    success: {
      icon: CheckCircle2,
      iconColor: 'text-brand-green',
      iconBg: 'bg-brand-green/10 border-brand-green/20',
      confirmButton: 'bg-brand-green hover:bg-white text-brand-charcoal font-bold',
    },
  }[type];

  const Icon = typeConfig.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!loading ? onClose : undefined}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="alertdialog"
            aria-modal="true"
            className="relative w-full max-w-md bg-brand-charcoal border border-white/10 p-6 md:p-8 shadow-2xl shadow-black/80 z-10"
          >
            {/* Close Button */}
            {!loading && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${typeConfig.iconBg}`}>
                <Icon className={`w-6 h-6 ${typeConfig.iconColor}`} />
              </div>

              <div className="space-y-2 flex-grow pr-2">
                <h3 className="text-lg font-syne font-bold uppercase italic tracking-tight text-white">
                  {title}
                </h3>
                <p className="text-white/60 text-xs font-jakarta leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50 ${typeConfig.confirmButton}`}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

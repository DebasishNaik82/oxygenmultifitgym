'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastMethods = {
    success: useCallback(
      (message: string, title?: string, duration?: number) =>
        addToast('success', message, title, duration),
      [addToast]
    ),
    error: useCallback(
      (message: string, title?: string, duration?: number) =>
        addToast('error', message, title, duration),
      [addToast]
    ),
    info: useCallback(
      (message: string, title?: string, duration?: number) =>
        addToast('info', message, title, duration),
      [addToast]
    ),
    warning: useCallback(
      (message: string, title?: string, duration?: number) =>
        addToast('warning', message, title, duration),
      [addToast]
    ),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods, removeToast }}>
      {children}

      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const icons = {
    success: { icon: CheckCircle2, color: 'text-brand-green', border: 'border-brand-green/30' },
    error: { icon: AlertCircle, color: 'text-red-400', border: 'border-red-500/30' },
    info: { icon: Info, color: 'text-sky-400', border: 'border-sky-500/30' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', border: 'border-amber-500/30' },
  }[item.type];

  const IconComponent = icons.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto p-4 bg-brand-charcoal border ${icons.border} shadow-2xl flex items-start gap-3 relative overflow-hidden`}
    >
      <IconComponent className={`w-5 h-5 shrink-0 ${icons.color} mt-0.5`} />
      <div className="flex-grow pr-2">
        {item.title && (
          <h4 className="text-xs font-syne font-bold uppercase tracking-wider text-white mb-0.5">
            {item.title}
          </h4>
        )}
        <p className="text-xs font-jakarta text-white/80 leading-relaxed">{item.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-white/40 hover:text-white p-1 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ROBINHOOD_CHAIN } from '@/config/network';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'whale';
  title: string;
  message?: string;
  txHash?: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  toastSuccess: (title: string, message?: string, txHash?: string) => void;
  toastError: (title: string, message?: string) => void;
  toastInfo: (title: string, message?: string) => void;
  toastWhale: (title: string, message?: string, txHash?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, txHash }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, txHash };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  const toastSuccess = useCallback(
    (title: string, message?: string, txHash?: string) => {
      showToast({ type: 'success', title, message, txHash });
    },
    [showToast]
  );

  const toastError = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'error', title, message });
    },
    [showToast]
  );

  const toastInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  const toastWhale = useCallback(
    (title: string, message?: string, txHash?: string) => {
      showToast({ type: 'whale', title, message, txHash });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        toastSuccess,
        toastError,
        toastInfo,
        toastWhale,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none font-mono text-xs">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              t.type === 'success'
                ? 'bg-zinc-950/95 border-emerald-500/40 text-zinc-100 shadow-emerald-500/10'
                : t.type === 'error'
                ? 'bg-zinc-950/95 border-red-500/40 text-zinc-100 shadow-red-500/10'
                : t.type === 'whale'
                ? 'bg-zinc-950/95 border-amber-500/40 text-zinc-100 shadow-amber-500/10'
                : 'bg-zinc-950/95 border-zinc-800 text-zinc-100'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    t.type === 'success'
                      ? 'bg-emerald-400'
                      : t.type === 'error'
                      ? 'bg-red-400'
                      : t.type === 'whale'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-blue-400'
                  }`}
                />
                <span className="font-semibold text-zinc-100">{t.title}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-zinc-500 hover:text-zinc-300 -mr-1 -mt-1 p-1 text-xs"
              >
                ✕
              </button>
            </div>
            {t.message && <p className="text-[11px] text-zinc-400 mt-1 pl-4">{t.message}</p>}
            {t.txHash && (
              <div className="mt-1.5 pl-4">
                <a
                  href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/tx/${t.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  View on Robinscan ↗
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

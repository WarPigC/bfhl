import React from 'react';

interface ToastProps {
  toasts: { message: string; type: 'success' | 'error' | 'info'; id: number }[];
}

export function ToastContainer({ toasts }: ToastProps) {
  if (toasts.length === 0) return null;

  const typeStyles = {
    success: 'border-[var(--color-success)] bg-[var(--color-success-bg)]',
    error: 'border-[var(--color-error)] bg-[var(--color-error-bg)]',
    info: 'border-[var(--color-info)] bg-[var(--color-info-bg)]',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" id="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg border backdrop-blur-sm text-sm font-medium text-[var(--color-text-primary)] shadow-xl ${typeStyles[toast.type]}`}
          style={{ animation: 'slideDown 0.3s ease-out' }}
        >
          <span className="mr-2">{iconMap[toast.type]}</span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

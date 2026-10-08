import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface ToastProps {
  id?: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  message,
  variant = 'info',
  onClose,
}) => {
  const icons: Record<ToastVariant, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  const borderVariants: Record<ToastVariant, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    danger: 'border-rose-200 bg-rose-50 text-rose-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-sky-200 bg-sky-50 text-sky-900',
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-sm ${borderVariants[variant]}`}
    >
      {icons[variant]}
      <div className="flex-1 text-sm">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition-colors shrink-0 p-0.5 rounded"
          aria-label="Close toast"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

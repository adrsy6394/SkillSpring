'use client';

import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, confirmVariant = 'indigo' }) {
  if (!isOpen) return null;

  const variants = {
    violet: 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/30',
    red: 'bg-red-600 hover:bg-red-700 shadow-red-500/30',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 text-gray-900">
            <div className={`p-2 rounded-lg bg-gray-50`}>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            className={`w-full sm:w-auto px-6 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${variants[confirmVariant]}`}
          >
            {confirmText || 'Confirm'}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-gray-700 font-semibold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


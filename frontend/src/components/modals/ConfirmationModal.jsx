import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Confirm",
  isDestructive = true
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div 
        className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col">
        
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-2xl ${isDestructive ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div>
            <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h2>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 pt-0 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 h-12 font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className={`flex-1 h-12 font-black text-white rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isDestructive 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

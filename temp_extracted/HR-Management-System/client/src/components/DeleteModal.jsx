import Modal from "./ui/Modal";
import { Trash2, AlertCircle } from "lucide-react";

export default function DeleteModal({ isOpen, onClose, onConfirm, title, type = "item", isDeleting }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-sm">
        
        {/* ICON & TITLE */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-rose-50 rounded-xl">
            <Trash2 className="w-6 h-6 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Delete {type}
          </h2>
        </div>

        {/* MESSAGE */}
        <div className="space-y-4 mb-8">
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Are you sure you want to delete <span className="text-slate-900 font-bold">"{title}"</span>?
          </p>
          
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-8 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-lg shadow-rose-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-30"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `Delete ${type}`
            )}
          </button>
        </div>
        
      </div>
    </Modal>
  );
}
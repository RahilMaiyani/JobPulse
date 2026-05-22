import Modal from "./ui/Modal";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action may be permanent."
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md relative">
        {/* CLOSE ICON */}
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* CONTENT */}
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-rose-50 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2">
              {message}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-6 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-6 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-lg shadow-rose-100 transition-all active:scale-95"
          >
            Confirm Action
          </button>
        </div>
      </div>
    </Modal>
  );
}
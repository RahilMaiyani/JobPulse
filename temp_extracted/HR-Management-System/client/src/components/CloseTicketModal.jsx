import Modal from "./ui/Modal";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function CloseTicketModal({ isOpen, onClose, onConfirm, isClosing }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-sm">
        
        {/* ICON & TITLE */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-50 rounded-xl">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Close Ticket
          </h2>
        </div>

        {/* MESSAGE */}
        <div className="space-y-4 mb-8">
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Are you sure this issue is completely resolved?
          </p>
          
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              This will lock the ticket permanently
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isClosing}
            className="px-6 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isClosing}
            className="px-8 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-35"
          >
            {isClosing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Confirm & Close"
            )}
          </button>
        </div>
        
      </div>
    </Modal>
  );
}
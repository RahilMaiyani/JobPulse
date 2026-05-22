import { useState } from "react";
import Modal from "./ui/Modal";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function DecisionModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  isProcessing // <-- NEW: Receive loading state
}) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const isReject = type === "rejected";

  const handleSubmit = () => {
    if (isReject && !comment.trim()) {
      setError("Please provide a justification for this rejection.");
      return;
    }

    onSubmit(comment);
    // Removed setComment("") here so it doesn't clear while loading
    setError("");
  };

  // Reset comment when modal closes
  if (!isOpen && comment) {
      setComment("");
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={!isProcessing ? onClose : undefined}>
      <div className="w-full max-w-md">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${isReject ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {isReject ? <XCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight capitalize">
              {type} Application
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {isReject 
                ? "State the reason for declining this request." 
                : "Add an optional note for the employee."}
            </p>
          </div>
        </div>

        {/* INPUT */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Administrator Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError("");
              }}
              disabled={isProcessing} // Disable while loading
              rows="4"
              placeholder={isReject ? "Reason for rejection..." : "Notes (optional)..."}
              className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all resize-none bg-slate-50/50 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[11px] font-bold uppercase tracking-tight">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isProcessing} // Disable while loading
            className="px-6 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isProcessing} // Disable while loading
            className={`px-8 h-11 flex items-center justify-center gap-2 rounded-xl text-white text-sm font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${
              isReject 
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-100" 
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
            }`}
          >
            {isProcessing ? (
               <>
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Processing...
               </>
            ) : (
              `Confirm ${isReject ? "Rejection" : "Approval"}`
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
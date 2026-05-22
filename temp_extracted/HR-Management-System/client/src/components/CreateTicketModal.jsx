import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateTicket } from "../hooks/useTickets";
import toast from "react-hot-toast";

const CreateTicketModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    subject: "",
    category: "IT Support",
    priority: "Medium",
    description: "",
  });

  const { mutate: createTicket, isPending } = useCreateTicket(
    () => {
      // onSuccess
      setFormData({ subject: "", category: "IT Support", priority: "Medium", description: "" });
      onClose();
    },
    (error) => {
      // onError
      toast.error(error.response?.data?.msg || "Failed to submit ticket");
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      return toast.error("Subject and description are required.");
    }
    createTicket(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Raise a Support Ticket</h2>
            <p className="text-sm text-slate-500 mt-1">Provide details so we can help you faster.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              >
                <option>IT Support</option>
                <option>HR Inquiry</option>
                <option>Payroll</option>
                <option>Facilities</option>
                <option>General</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
            <input
              type="text"
              placeholder="E.g., Cannot connect to office VPN"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              rows="4"
              placeholder="Please describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center min-w-30 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-200 disabled:opacity-70"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
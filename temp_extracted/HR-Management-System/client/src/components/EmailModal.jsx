import { useEffect, useState } from "react";
import Modal from "./ui/Modal";
import { useSendEmail } from "../hooks/useEmail";
import { Mail, Send, AlertCircle, User } from "lucide-react";

export default function EmailModal({ isOpen, onClose, user, template }) {
  const send = useSendEmail();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSubject(template?.subject || "");
      setMessage(template?.message || "");
      setError("");
    }
  }, [isOpen, template]);

  if (!isOpen || !user) return null;

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required fields.");
      return;
    }

    send.mutate(
      {
        to: user.email,
        subject,
        message
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: () => {
          setError("The system failed to dispatch the email.");
        }
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg space-y-6">
        
        {/* HEADER */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Compose Email
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Send an official communication to the employee.
          </p>
        </div>

        {/* RECIPIENT BOX */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <img
            src={
              user.profilePic ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f1f5f9&color=475569`
            }
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
            alt={user.name}
          />
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recipient</p>
            <p className="text-sm font-bold text-slate-800">{user.name} <span className="font-medium text-slate-500 ml-1">({user.email})</span></p>
          </div>
        </div>

        {/* FORM FIELDS */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Subject Line
            </label>
            <input
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setError("");
              }}
              placeholder="e.g., Attendance Discrepancy Notice"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Message Content
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError("");
              }}
              placeholder="Type your official message here..."
              className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[11px] font-bold uppercase">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-6 h-11 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            disabled={send.isPending}
            className="flex-1 lg:flex-none px-8 h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {send.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Dispatch Email
              </>
            )}
          </button>
        </div>

      </div>
    </Modal>
  );
}
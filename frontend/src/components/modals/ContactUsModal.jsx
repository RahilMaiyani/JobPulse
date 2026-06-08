import useEscapeKey from '../../hooks/useEscapeKey';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, MessageSquare } from 'lucide-react';
import { useSendMessage } from '../../hooks/useContact';
import toast from 'react-hot-toast';

export default function ContactUsModal({ onClose }) {
  useEscapeKey(onClose);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const sendMessageMutation = useSendMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (subject.trim().length < 5 || subject.trim().length > 255) {
      return toast.error("Subject must be between 5 and 255 characters.");
    }
    if (message.trim().length < 10 || message.trim().length > 1000) {
      return toast.error("Message must be between 10 and 1000 characters.");
    }

    try {
      await sendMessageMutation.mutateAsync({ subject, message });
      toast.success("Message sent successfully!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send message.");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5 text-white dark:text-zinc-900" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Contact Us</h2>
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">Send a message to Admins / HRs</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all"
              placeholder="Brief subject of your message..."
              maxLength={255}
            />
            <div className="text-[10px] font-bold text-right text-zinc-400 dark:text-zinc-500">
              {subject.length}/255
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all resize-none h-32"
              placeholder="Describe your issue or query here in detail..."
              maxLength={1000}
            />
            <div className="text-[10px] font-bold text-right text-zinc-400 dark:text-zinc-500">
              {message.length}/1000
            </div>
          </div>

          <button
            type="submit"
            disabled={sendMessageMutation.isPending}
            className="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {sendMessageMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

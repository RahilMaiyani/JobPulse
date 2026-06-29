import React, { useState } from 'react';
import { useProctoringEvents, useForgiveProctoring } from '../../hooks/useProctoringEvents';
import { AlertTriangle, Clock, MousePointer2, Copy, MonitorOff, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

const EVENT_ICONS = {
  tab_switch: <MonitorOff className="w-4 h-4 text-amber-500" />,
  mouse_exit: <MousePointer2 className="w-4 h-4 text-amber-500" />,
  copy_attempt: <Copy className="w-4 h-4 text-rose-500" />,
  screen_disconnected: <MonitorOff className="w-4 h-4 text-rose-500" />,
  camera_disconnected: <MonitorOff className="w-4 h-4 text-rose-500" />
};

export default function ProctoringReport({ application }) {
  const { data: events = [], isLoading } = useProctoringEvents(application.id);
  const forgiveMutation = useForgiveProctoring();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleForgive = () => {
    if (window.confirm("Are you sure you want to forgive these violations? This will restore the candidate's original score.")) {
      forgiveMutation.mutate(application.id, {
        onSuccess: () => toast.success("Violations forgiven and score restored.")
      });
    }
  };

  const hasViolations = events.length > 0;
  const isFailedDueToProctoring = application.mcq_score === 0 && application.original_score > 0 && !application.is_proctoring_forgiven;

  return (
    <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          Proctoring Report
        </h3>
        {isFailedDueToProctoring && (
          <button
            onClick={handleForgive}
            disabled={forgiveMutation.isPending}
            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            {forgiveMutation.isPending ? 'Processing...' : 'Forgive Violations & Restore Score'}
          </button>
        )}
        {application.is_proctoring_forgiven && (
           <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded border border-emerald-200 dark:border-emerald-500/20">
             Violations Forgiven (Original Score Restored)
           </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !hasViolations ? (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No suspicious activity detected during the test.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4">
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> 
              {events.length} violations logged during the test.
            </p>
          </div>

          <div className="relative border-l-2 border-zinc-200 dark:border-zinc-700 ml-3 pl-4 space-y-6 mt-4">
            {events.map((event, index) => (
              <div key={event.id} className="relative">
                <div className="absolute -left-[23px] top-1 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-full p-0.5">
                  {EVENT_ICONS[event.event_type] || <AlertTriangle className="w-3 h-3 text-zinc-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                      {event.event_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(event.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  {event.file_path && event.file_path !== 'no-image' && (
                    <div 
                      className="mt-2 w-48 h-32 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden cursor-pointer hover:ring-2 ring-indigo-500 transition-all"
                      onClick={() => setSelectedImage(event.file_path)}
                    >
                      <img src={event.file_path} alt="Violation snapshot" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {selectedImage && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={() => setSelectedImage(null)}>
            <X className="w-6 h-6" />
          </button>
          <img src={selectedImage} alt="Fullscreen evidence" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>,
        document.body
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useProctoringEvents, useForgiveProctoring } from '../../hooks/useProctoringEvents';
import { AlertTriangle, Clock, MousePointer2, Copy, MonitorOff, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import useEscapeKey from '../../hooks/useEscapeKey';

const EVENT_ICONS = {
  tab_switch: <MonitorOff className="w-4 h-4 text-amber-500" />,
  mouse_exit: <MousePointer2 className="w-4 h-4 text-amber-500" />,
  copy_attempt: <Copy className="w-4 h-4 text-rose-500" />,
  screen_disconnected: <MonitorOff className="w-4 h-4 text-rose-500" />,
  camera_disconnected: <MonitorOff className="w-4 h-4 text-rose-500" />
};

export default function ProctoringReportModal({ application, onClose }) {
  useEscapeKey(onClose);
  const { data: events = [], isLoading } = useProctoringEvents(application.id);
  const forgiveMutation = useForgiveProctoring();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleForgive = () => {
    if (window.confirm("Are you sure you want to forgive these violations? This will restore the candidate's original score.")) {
      forgiveMutation.mutate(application.id, {
        onSuccess: () => {
          toast.success("Violations forgiven and score restored.");
        }
      });
    }
  };

  const hasViolations = events.length > 0;
  const isFailedDueToProctoring = application.has_proctoring_violation && !application.is_proctoring_forgiven;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/60 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Standard Modal Content */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">

        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
              Proctoring Report
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Reviewing evidence for <span className="text-zinc-700 dark:text-zinc-300 font-bold">{application.candidate_name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !hasViolations ? (
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-8 text-center border border-zinc-200 dark:border-zinc-800">
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">No suspicious activity detected.</p>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">This candidate completed the test cleanly.</p>
            </div>
          ) : (
            <div className="space-y-6">

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-5">
                <div>
                  <p className="text-base font-black text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {events.length} violations logged
                  </p>
                  <p className="text-sm text-rose-600/80 dark:text-rose-400/80 font-medium mt-1">
                    The system automatically terminated the test.
                  </p>
                </div>
                {isFailedDueToProctoring && (
                  <button
                    onClick={handleForgive}
                    disabled={forgiveMutation.isPending}
                    className="shrink-0 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold rounded-lg border border-emerald-200 dark:border-emerald-500/30 transition-all disabled:opacity-50"
                  >
                    {forgiveMutation.isPending ? 'Processing...' : 'Forgive & Restore Score'}
                  </button>
                )}
                {application.is_proctoring_forgiven && (
                  <span className="shrink-0 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                    Violations Forgiven
                  </span>
                )}
              </div>

              <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 pl-6 space-y-8 py-2 mt-8">
                {events.map((event, index) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[35px] top-1 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-full p-1.5">
                      {EVENT_ICONS[event.event_type] || <AlertTriangle className="w-4 h-4 text-zinc-400" />}
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-3">
                        <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                          {event.event_type.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-bold text-zinc-500 dark:text-zinc-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {new Date(event.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      {event.file_path && event.file_path !== 'no-image' ? (
                        <div
                          className="mt-2 w-full sm:w-80 aspect-video rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-pointer hover:ring-2 ring-indigo-500 transition-all bg-zinc-100 dark:bg-zinc-950"
                          onClick={() => setSelectedImage(event.file_path)}
                        >
                          <img src={event.file_path} alt="Violation snapshot" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ) : (
                        <div className="mt-2 w-full sm:w-80 aspect-video rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
                          <MonitorOff className="w-8 h-8 mb-2 opacity-30" />
                          <span className="text-sm font-medium">No screenshot captured</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {selectedImage && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={() => setSelectedImage(null)}>
            <X className="w-6 h-6" />
          </button>
          <img src={selectedImage} alt="Fullscreen evidence" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>,
        document.body
      )}
    </div>,
    document.body
  );
}

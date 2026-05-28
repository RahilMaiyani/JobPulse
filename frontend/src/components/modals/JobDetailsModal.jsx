import React from 'react';
import { Briefcase, MapPin, X, CheckCircle2, ChevronRight } from 'lucide-react';

export default function JobDetailsModal({ job, onClose, onApply, appliedApplication }) {
  const isExpired = job.application_deadline && new Date(job.application_deadline) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col border border-transparent dark:border-zinc-800">
        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start bg-zinc-50/50 dark:bg-zinc-800/50">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-zinc-700">
              <Briefcase className="w-7 h-7 text-indigo-600 dark:text-zinc-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location || 'Remote'}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">{job.job_type}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {job.salary_min ? `₹${(job.salary_min / 1000).toFixed(0)}k - ₹${(job.salary_max / 1000).toFixed(0)}k` : 'Competitive Salary'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-zinc-900">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-4">Role Overview</h3>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">{job.description}</p>

            {job.requirements && (
              <>
                <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800 my-8"></div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-4">Requirements & Skills</h3>
                <ul className="space-y-3">
                  {typeof job.requirements === 'object' && Array.isArray(job.requirements)
                    ? job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))
                    : <li className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{job.requirements}</span>
                    </li>
                  }
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center">
          <div className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
            {job.application_deadline
              ? `Apply before ${new Date(job.application_deadline).toLocaleDateString()}`
              : 'Open until filled'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 h-12 font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Close
            </button>
            {appliedApplication ? (
              <button
                disabled
                className="px-8 h-12 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-center gap-2 cursor-not-allowed"
              >
                Applied on {new Date(appliedApplication.applied_at).toLocaleDateString()} <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : isExpired ? (
              <button
                disabled
                className="px-8 h-12 font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center gap-2 cursor-not-allowed"
              >
                Expired
              </button>
            ) : (
              <button
                onClick={onApply}
                className="px-8 h-12 font-bold text-white dark:text-zinc-900 bg-indigo-600 dark:bg-zinc-100 hover:bg-indigo-700 dark:hover:bg-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2"
              >
                Apply Now <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

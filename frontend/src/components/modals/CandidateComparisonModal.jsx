import useEscapeKey from '../../hooks/useEscapeKey';
import React from 'react';
import { X, CheckCircle2, FileQuestion, Download, Sparkles } from 'lucide-react';

export default function CandidateComparisonModal({ job, applicants, onClose, onStatusChange }) {
  useEscapeKey(onClose);

    if (!applicants || applicants.length === 0) return null;

    // Find the highest AI match score to highlight the best candidate
    const highestAiScore = Math.max(...applicants.map(a => a.ai_match_score || 0));

    // Dynamic tailwind classes based on number of candidates (2 or 3)
    const colSpanClass = applicants.length === 3 ? "col-span-3" : "col-span-5";
    const headerSpanClass = applicants.length === 3 ? "col-span-3" : "col-span-2";

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
        if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20';
        return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20';
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/60 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}></div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-6xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" /> Comparison Matrix
                        </h2>
                        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">Comparing {applicants.length} candidates for {job?.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Matrix Grid */}
                <div className="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-zinc-950">
                    <div className="min-w-[800px]">
                        {/* Table Header Row (Sticky) */}
                        <div className="grid grid-cols-12 sticky top-0 z-20 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className={`${headerSpanClass} p-4 flex items-center text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-r border-zinc-200 dark:border-zinc-800`}>
                                Metrics
                            </div>
                            {applicants.map((app) => (
                                <div key={app.id} className={`${colSpanClass} p-4 border-r border-zinc-200 dark:border-zinc-800 last:border-0 relative ${app.ai_match_score === highestAiScore ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}>
                                    {app.ai_match_score === highestAiScore && (
                                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 rounded-t-sm"></div>
                                    )}
                                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 truncate">{app.candidate_name}</h3>
                                    <p className="text-xs font-medium text-zinc-500 truncate">{app.candidate_email}</p>
                                </div>
                            ))}
                        </div>

                        {/* Application Details */}
                        <div className="grid grid-cols-12 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                            <div className={`${headerSpanClass} p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800/50 flex items-center`}>
                                Status Update
                            </div>
                            {applicants.map((app) => (
                                <div key={app.id} className={`${colSpanClass} p-4 border-r border-zinc-100 dark:border-zinc-800/50 last:border-0`}>
                                    <select
                                        className="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 outline-none shadow-sm cursor-pointer"
                                        defaultValue={app.status}
                                        onChange={(e) => onStatusChange(app.id, e.target.value)}
                                    >
                                        <option value="applied">Applied</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="interview">Interview</option>
                                        <option value="selected">Hired</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* AI Match Score */}
                        <div className="grid grid-cols-12 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                            <div className={`${headerSpanClass} p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800/50 flex items-center`}>
                                AI Match Score
                            </div>
                            {applicants.map((app) => (
                                <div key={app.id} className={`${colSpanClass} p-4 border-r border-zinc-100 dark:border-zinc-800/50 last:border-0 flex items-center`}>
                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-black border ${getScoreColor(app.ai_match_score)}`}>
                                        {app.ai_match_score}%
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Aptitude Score */}
                        <div className="grid grid-cols-12 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                            <div className={`${headerSpanClass} p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800/50 flex items-center`}>
                                Aptitude Test
                            </div>
                            {applicants.map((app) => (
                                <div key={app.id} className={`${colSpanClass} p-4 border-r border-zinc-100 dark:border-zinc-800/50 last:border-0 flex items-center`}>
                                    {app.mcq_completed_at ? (
                                        <div className="flex items-center gap-2">
                                            <FileQuestion className="w-4 h-4 text-zinc-400" />
                                            <span className={`text-sm font-black ${app.mcq_passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                {app.mcq_score}% ({app.mcq_passed ? 'Passed' : 'Failed'})
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-bold text-zinc-400 italic">Not taken yet</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Strengths */}
                        <div className="grid grid-cols-12 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                            <div className={`${headerSpanClass} p-4 text-xs font-bold text-emerald-600 dark:text-emerald-500 border-r border-zinc-100 dark:border-zinc-800/50`}>
                                Key Strengths
                            </div>
                            {applicants.map((app) => (
                                <div key={app.id} className={`${colSpanClass} p-4 border-r border-zinc-100 dark:border-zinc-800/50 last:border-0`}>
                                    <ul className="space-y-1">
                                        {app.ai_match_details?.strengths?.map((s, i) => (
                                            <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">• {s}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Weaknesses */}
                        <div className="grid grid-cols-12 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                            <div className={`${headerSpanClass} p-4 text-xs font-bold text-amber-600 dark:text-amber-500 border-r border-zinc-100 dark:border-zinc-800/50`}>
                                Areas to Improve
                            </div>
                            {applicants.map((app) => (
                                <div key={app.id} className={`${colSpanClass} p-4 border-r border-zinc-100 dark:border-zinc-800/50 last:border-0`}>
                                    <ul className="space-y-1">
                                        {app.ai_match_details?.weaknesses?.map((w, i) => (
                                            <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">• {w}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-12 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                            <div className={`${headerSpanClass} p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800/50 flex items-center`}>
                                Actions
                            </div>
                            {applicants.map((app) => (
                                <div key={app.id} className={`${colSpanClass} p-4 border-r border-zinc-100 dark:border-zinc-800/50 last:border-0`}>
                                    {app.resume_path ? (
                                        <a
                                            href={app.resume_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-4 h-9 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-black rounded-xl transition-all shadow-sm active:scale-95"
                                        >
                                            <Download className="w-3.5 h-3.5" /> View Resume
                                        </a>
                                    ) : (
                                        <span className="text-sm font-bold text-zinc-400 italic">No resume</span>
                                    )}
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

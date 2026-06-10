import useEscapeKey from '../../hooks/useEscapeKey';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { X, Users, Search, Download, CheckCircle2, Ban, ChevronDown, ChevronUp, FileQuestion, Sparkles, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApplicationsForJob } from '../../hooks/useApplications';
import { bulkUpdateApplicationStatuses } from '../../services/applicationService';
import ConfirmationModal from './ConfirmationModal';
import CandidateComparisonModal from './CandidateComparisonModal';


export default function JobApplicantsModal({ job, onClose }) {
  useEscapeKey(onClose);

  const { data: jobApplicants = [], isLoading: loadingApplicants } = useApplicationsForJob(job?.id);

  const [expandedApplicantId, setExpandedApplicantId] = useState(null);
  const queryClient = useQueryClient();

  // Search, Filter, Pagination
  const [applicantSearchTerm, setApplicantSearchTerm] = useState("");
  const [applicantSortBy, setApplicantSortBy] = useState("highest_ai");
  const [applicantPage, setApplicantPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // AI Auto-Shortlist State
  const appliedApplicants = useMemo(() => jobApplicants.filter(a => a.status === 'applied'), [jobApplicants]);
  const alreadyShortlistedCount = useMemo(() => jobApplicants.filter(a => a.status === 'shortlisted' || a.status === 'hired').length, [jobApplicants]);

  const [shortlistCount, setShortlistCount] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const lastJobIdRef = useRef(null);

  useEffect(() => {
    if (job?.id && appliedApplicants.length > 0 && job.id !== lastJobIdRef.current) {
      lastJobIdRef.current = job.id;
      setShortlistCount(Math.min(appliedApplicants.length, 10));
    }
  }, [job?.id, appliedApplicants.length]);

  const handleBulkShortlist = async () => {
    const count = parseInt(shortlistCount) || 0;
    if (count < 1) return toast.error("Please enter a valid number.");

    if (count > appliedApplicants.length) {
      toast.error(`Cannot shortlist ${count} candidates. Only ${appliedApplicants.length} available.`);
      return;
    }

    setIsBulkUpdating(true);

    // Sort purely by AI score descending
    const sortedApplied = [...appliedApplicants].sort((a, b) => b.ai_match_score - a.ai_match_score);

    const updates = sortedApplied.map((app, index) => ({
      id: app.id,
      status: index < count ? 'shortlisted' : 'rejected'
    }));

    // Optimistic UI Update directly to specific query keys
    const updateCache = (oldData) => {
      if (!Array.isArray(oldData)) return oldData;
      const updatesMap = new Map(updates.map(u => [u.id, u.status]));
      return oldData.map(app => {
        if (updatesMap.has(app.id)) {
          return { ...app, status: updatesMap.get(app.id) };
        }
        return app;
      });
    };

    queryClient.setQueryData(['job-applications', Number(job.id)], updateCache);
    queryClient.setQueryData(['job-applications', String(job.id)], updateCache);

    try {
      await bulkUpdateApplicationStatuses(job.id, updates);
      toast.success(`Successfully shortlisted top ${count} candidates!`);
    } catch (err) {
      toast.error("Failed to execute bulk shortlist");
    } finally {
      queryClient.invalidateQueries({ queryKey: ['job-applications', job.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      setIsBulkUpdating(false);
      setShowBulkConfirm(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    // Optimistic UI Update for single dropdown
    const updateCache = (oldData) => {
      if (!Array.isArray(oldData)) return oldData;
      return oldData.map(app => app.id === appId ? { ...app, status: newStatus } : app);
    };
    queryClient.setQueryData(['job-applications', Number(job.id)], updateCache);
    queryClient.setQueryData(['job-applications', String(job.id)], updateCache);

    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['job-applications', job.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'candidate'] });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update status");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
    if (score >= 50) return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20';
    return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20';
  };

  const filteredAndSortedApplicants = useMemo(() => {
    let result = [...jobApplicants];

    // Search
    if (applicantSearchTerm.trim()) {
      const lowerQuery = applicantSearchTerm.toLowerCase();
      result = result.filter(app =>
        (app.candidate_name && app.candidate_name.toLowerCase().includes(lowerQuery)) ||
        (app.candidate_email && app.candidate_email.toLowerCase().includes(lowerQuery))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (applicantSortBy === 'highest_ai') {
        return b.ai_match_score - a.ai_match_score;
      } else if (applicantSortBy === 'lowest_ai') {
        return a.ai_match_score - b.ai_match_score;
      } else if (applicantSortBy === 'highest_mcq') {
        const scoreA = a.mcq_score != null ? a.mcq_score : -1;
        const scoreB = b.mcq_score != null ? b.mcq_score : -1;
        return scoreB - scoreA;
      } else if (applicantSortBy === 'newest') {
        return new Date(b.applied_at) - new Date(a.applied_at);
      } else if (applicantSortBy === 'oldest') {
        return new Date(a.applied_at) - new Date(b.applied_at);
      }
      return 0;
    });

    return result;
  }, [jobApplicants, applicantSearchTerm, applicantSortBy]);

  useEffect(() => {
    setApplicantPage(1);
  }, [applicantSearchTerm, applicantSortBy]);

  const totalApplicantPages = Math.ceil(filteredAndSortedApplicants.length / itemsPerPage);
  const paginatedApplicants = filteredAndSortedApplicants.slice((applicantPage - 1) * itemsPerPage, applicantPage * itemsPerPage);

  if (!job) return null;

  const handleToggleCompare = (applicant) => {
    setSelectedForComparison(prev => {
      const isSelected = prev.some(a => a.id === applicant.id);
      if (isSelected) {
        return prev.filter(a => a.id !== applicant.id);
      }
      else {
        if (prev.length >= 3) {
          toast.error("You can only compare up to 3 candidates at once.");
          return prev;
        }
        return [...prev, applicant]
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85dvh]">
        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-zinc-700">
                <Users className="w-6 h-6 text-indigo-600 dark:text-zinc-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Applicants for {job.title}</h2>
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">{jobApplicants.length} total applicants</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* BULK SHORTLIST BAR (Only visible if >1 'applied' and NO ONE is already shortlisted) */}
          {appliedApplicants.length > 1 && alreadyShortlistedCount === 0 && (
            <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Bulk Shortlist</h3>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">{appliedApplicants.length} candidates awaiting review.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-zinc-500 dark:text-zinc-400">Top</span>
                  <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm h-10">
                    <button
                      onClick={() => setShortlistCount(prev => Math.max(1, (parseInt(prev) || 0) - 1))}
                      className="w-8 h-full flex items-center justify-center text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-r border-zinc-200 dark:border-zinc-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="text"
                      value={shortlistCount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val === '') setShortlistCount('');
                        else setShortlistCount(Math.min(appliedApplicants.length, parseInt(val)));
                      }}
                      onBlur={() => {
                        if (!shortlistCount || parseInt(shortlistCount) < 1) setShortlistCount(1);
                      }}
                      className="w-10 h-full text-center bg-transparent text-sm font-black text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    />
                    <button
                      onClick={() => setShortlistCount(prev => Math.min(appliedApplicants.length, (parseInt(prev) || 0) + 1))}
                      className="w-8 h-full flex items-center justify-center text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-l border-zinc-200 dark:border-zinc-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowBulkConfirm(true)}
                  className="h-10 px-4 flex-1 md:flex-none bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-black rounded-xl shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center"
                >
                  <span className="hidden sm:inline">Shortlist & Reject Rest</span>
                  <span className="sm:hidden">Auto Shortlist</span>
                </button>
              </div>
            </div>
          )}

          {/* SEARCH AND SORT BAR */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search applicants by name or email..."
                value={applicantSearchTerm}
                onChange={(e) => setApplicantSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 outline-none transition-all shadow-sm dark:shadow-none"
              />
            </div>
            <select
              value={applicantSortBy}
              onChange={(e) => setApplicantSortBy(e.target.value)}
              className="h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 outline-none shadow-sm dark:shadow-none"
            >
              <option value="highest_ai">Highest AI Score</option>
              <option value="lowest_ai">Lowest AI Score</option>
              <option value="highest_mcq">Highest Aptitude Score</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-zinc-50/30 dark:bg-zinc-900">
          {loadingApplicants ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 animate-pulse"></div>
              ))}
            </div>
          ) : filteredAndSortedApplicants.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
              <Users className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No applicants found</h3>
              <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-1">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedApplicants.map((app) => (
                <div key={app.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-200 dark:hover:border-zinc-700 hover:shadow-md transition-all">
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpandedApplicantId(expandedApplicantId === app.id ? null : app.id)}>
                      {/* Custom Compare Checkbox */}
                      {app.candidate_is_active && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents opening the details accordion
                            handleToggleCompare(app);
                          }}
                          disabled={!selectedForComparison.some(a => a.id === app.id) && selectedForComparison.length >= 3}
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all border ${selectedForComparison.some(a => a.id === app.id)
                            ? 'bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white text-white dark:text-zinc-900'
                            : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                        >
                          {selectedForComparison.some(a => a.id === app.id) && (
                            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      )}

                      <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 ${getScoreColor(app.ai_match_score)}`}>
                        <span className="text-xs font-black opacity-80 uppercase leading-none mt-1">Score</span>
                        <span className="text-lg font-black leading-none mb-1">{app.ai_match_score}</span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          {app.candidate_name}
                          {app.is_suspicious && (
                            <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest rounded border border-rose-200 dark:border-rose-500/20">Suspicious</span>
                          )}
                        </h4>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{app.candidate_email} • Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                        {app.mcq_completed_at && (
                          <p className="text-xs font-black mt-1 flex items-center gap-1">
                            <FileQuestion className="w-3 h-3 text-indigo-500" />
                            <span className="text-zinc-500 dark:text-zinc-500">Aptitude Score:</span>
                            <span className={app.mcq_passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                              {app.mcq_score}% ({app.mcq_passed ? 'Passed' : 'Failed'})
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedApplicantId(expandedApplicantId === app.id ? null : app.id)}
                        className="text-xs font-bold text-indigo-600 dark:text-zinc-300 bg-indigo-50 dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        {expandedApplicantId === app.id ? (
                          <>Hide Details <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>View Details <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>

                      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800"></div>

                      {!app.candidate_is_active ? (
                        <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5">
                          <Ban className="w-3.5 h-3.5" /> Deactivated
                        </span>
                      ) : (
                        <>
                          {app.resume_path && (
                            <a
                              href={app.resume_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 h-9 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700"
                            >
                              <Download className="w-3.5 h-3.5" /> Resume
                            </a>
                          )}
                          <select
                            className="h-9 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 outline-none"
                            defaultValue={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            disabled={!app.candidate_is_active}
                          >
                            <option value="applied">Applied</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview">Interview</option>
                            <option value="selected">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>

                  {/* AI Details Expandable Section */}
                  {expandedApplicantId === app.id && (
                    <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Strengths</p>
                          <ul className="space-y-2">
                            {app.ai_match_details?.strengths?.map((s, i) => (
                              <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-black text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Areas to Improve</p>
                          <ul className="space-y-2">
                            {app.ai_match_details?.weaknesses?.map((w, i) => (
                              <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">• {w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {app.ai_match_details?.reasoning && (
                        <div className="mt-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 italic font-medium">"{app.ai_match_details.reasoning}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applicant Pagination */}
        {totalApplicantPages > 1 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-center items-center gap-2 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-b-3xl">
            <button
              onClick={() => setApplicantPage(prev => Math.max(prev - 1, 1))}
              disabled={applicantPage === 1}
              className="px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
              Page {applicantPage} of {totalApplicantPages}
            </div>
            <button
              onClick={() => setApplicantPage(prev => Math.min(prev + 1, totalApplicantPages))}
              disabled={applicantPage === totalApplicantPages}
              className="px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BAR FOR COMPARISON */}
      <div
        className={`fixed bottom-24 left-0 right-0 mx-auto w-[90vw] md:w-max md:absolute md:bottom-6 md:left-1/2 md:right-auto md:mx-0 md:-translate-x-1/2 z-[70] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform ${selectedForComparison.length >= 2 && showComparisonModal === false
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-y-24 opacity-0 scale-95 pointer-events-none'
          }`}
      >
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-[2rem] md:rounded-full shadow-[0_12px_40px_rgb(0,0,0,0.2)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.6)] border border-zinc-200/80 dark:border-zinc-700/80 p-2 md:p-2 flex items-center justify-between gap-2 md:gap-4 max-w-md mx-auto md:mx-0">
          <span className="text-zinc-900 dark:text-white text-xs md:text-sm font-black pl-2 md:pl-4 py-1 flex items-center gap-1.5 md:gap-2 truncate">
            <span className="w-5 h-5 md:w-5 md:h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] md:text-xs shrink-0">
              {selectedForComparison.length}
            </span>
            <span className="hidden md:inline">Candidates Selected</span>
            <span className="md:hidden">Selected</span>
          </span>

          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 shrink-0"></div>

          <div className="flex items-center gap-1 md:gap-2 shrink-0 pr-1">
            <button
              onClick={() => { setSelectedForComparison([]); setShowComparisonModal(false); }}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors px-2 py-1"
            >
              Clear
            </button>

            <button
              onClick={() => setShowComparisonModal(true)}
              className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs md:text-sm font-black px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm active:scale-95"
            >
              Compare
            </button>
          </div>
        </div>
      </div>


      {/* BULK CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        title="Confirm Bulk Shortlist"
        message={
          <>
            You are about to shortlist <strong className="text-zinc-900 dark:text-zinc-100">{shortlistCount}</strong> candidates based on their match scores and <strong className="text-rose-600 dark:text-rose-400">reject</strong> the remaining {appliedApplicants.length - (parseInt(shortlistCount) || 0)} candidates. This action cannot be undone.
          </>
        }
        onConfirm={handleBulkShortlist}
        isDestructive={true}
        confirmText="Confirm & Execute"
      />

      {/* COMPARISON MODAL */}
      {showComparisonModal && (
        <CandidateComparisonModal
          job={job}
          applicants={selectedForComparison}
          onClose={() => setShowComparisonModal(false)}
          onStatusChange={(appId, newStatus) => {
            handleStatusChange(appId, newStatus);
            setSelectedForComparison(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
          }}
        />
      )}

    </div>
    , document.body);
}

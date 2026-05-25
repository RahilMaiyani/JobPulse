import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { X, Users, Search, Download, CheckCircle2, Ban, ChevronDown, ChevronUp, FileQuestion } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobApplicantsModal({ job, onClose }) {
  const [jobApplicants, setJobApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [expandedApplicantId, setExpandedApplicantId] = useState(null);
  
  // Search, Filter, Pagination
  const [applicantSearchTerm, setApplicantSearchTerm] = useState("");
  const [applicantSortBy, setApplicantSortBy] = useState("highest_ai"); 
  const [applicantPage, setApplicantPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (job) {
      fetchApplicants();
    }
  }, [job]);

  const fetchApplicants = async () => {
    setLoadingApplicants(true);
    setExpandedApplicantId(null);
    setApplicantSearchTerm("");
    setApplicantSortBy("highest_ai");
    setApplicantPage(1);
    try {
      const response = await api.get(`/applications/job/${job.id}`);
      setJobApplicants(response.data.applications || []);
    } catch (err) {
      toast.error("Failed to fetch applicants");
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      setJobApplicants(prev => prev.map(app =>
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update status");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Applicants for {job.title}</h2>
                <p className="text-sm font-bold text-slate-500 mt-0.5">{jobApplicants.length} total applicants</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SEARCH AND SORT BAR */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search applicants by name or email..."
                value={applicantSearchTerm}
                onChange={(e) => setApplicantSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 h-10 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm"
              />
            </div>
            <select
              value={applicantSortBy}
              onChange={(e) => setApplicantSortBy(e.target.value)}
              className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none shadow-sm"
            >
              <option value="highest_ai">Highest AI Score</option>
              <option value="lowest_ai">Lowest AI Score</option>
              <option value="highest_mcq">Highest Aptitude Score</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/30">
          {loadingApplicants ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : filteredAndSortedApplicants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No applicants found</h3>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedApplicants.map((app) => (
                <div key={app.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpandedApplicantId(expandedApplicantId === app.id ? null : app.id)}>
                      <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 ${getScoreColor(app.ai_match_score)}`}>
                        <span className="text-xs font-black opacity-80 uppercase leading-none mt-1">Score</span>
                        <span className="text-lg font-black leading-none mb-1">{app.ai_match_score}</span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          {app.candidate_name}
                          {app.is_suspicious && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded border border-rose-200">Suspicious</span>
                          )}
                        </h4>
                        <p className="text-xs font-medium text-slate-500">{app.candidate_email} • Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                        {app.mcq_completed_at && (
                          <p className="text-xs font-black mt-1 flex items-center gap-1">
                            <FileQuestion className="w-3 h-3 text-indigo-500" />
                            <span className="text-slate-500">Aptitude Score:</span>
                            <span className={app.mcq_passed ? "text-emerald-600" : "text-rose-600"}>
                              {app.mcq_score}% ({app.mcq_passed ? 'Passed' : 'Failed'})
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedApplicantId(expandedApplicantId === app.id ? null : app.id)}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        {expandedApplicantId === app.id ? (
                          <>Hide Details <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>View Details <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>

                      <div className="w-px h-6 bg-slate-200"></div>

                      {!app.candidate_is_active ? (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1.5">
                          <Ban className="w-3.5 h-3.5" /> Deactivated
                        </span>
                      ) : (
                        <>
                          {app.resume_path && (
                            <a
                              href={`http://localhost:5000${app.resume_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                            >
                              <Download className="w-3.5 h-3.5" /> Resume
                            </a>
                          )}
                          <select
                            className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none"
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
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <p className="text-sm font-black text-emerald-600 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Strengths</p>
                          <ul className="space-y-2">
                            {app.ai_match_details?.strengths?.map((s, i) => (
                              <li key={i} className="text-sm text-slate-700 font-medium leading-relaxed">• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-black text-amber-600 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Areas to Improve</p>
                          <ul className="space-y-2">
                            {app.ai_match_details?.weaknesses?.map((w, i) => (
                              <li key={i} className="text-sm text-slate-700 font-medium leading-relaxed">• {w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {app.ai_match_details?.reasoning && (
                        <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl">
                          <p className="text-sm text-slate-600 italic font-medium">"{app.ai_match_details.reasoning}"</p>
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
          <div className="p-4 border-t border-slate-100 flex justify-center items-center gap-2 bg-slate-50/50 rounded-b-3xl">
            <button
              onClick={() => setApplicantPage(prev => Math.max(prev - 1, 1))}
              disabled={applicantPage === 1}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="text-sm font-bold text-slate-600">
              Page {applicantPage} of {totalApplicantPages}
            </div>
            <button
              onClick={() => setApplicantPage(prev => Math.min(prev + 1, totalApplicantPages))}
              disabled={applicantPage === totalApplicantPages}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

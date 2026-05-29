import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useMyApplications, useRevokeApplication } from '../../hooks/useApplications';
import { Briefcase, Calendar, CheckCircle2, XCircle, AlertCircle, Clock, X, Trash2, MapPin, FileQuestion, ChevronRight, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import MyApplicationsSkeleton from '../../components/skeletons/MyApplicationsSkeleton';
import ApplicationDetailsModal from '../../components/modals/ApplicationDetailsModal';

export default function MyApplications() {
  const [selectedApp, setSelectedApp] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const { data: applications = [], isLoading: loading } = useMyApplications();

  const revokeMutation = useRevokeApplication();

  const handleRevoke = (appId) => {
    if (!window.confirm("Are you sure you want to revoke this application?")) return;
    revokeMutation.mutate(appId, {
      onSuccess: () => setSelectedApp(null)
    });
  };


  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'applied': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold text-xs rounded-full border border-blue-200 dark:border-blue-500/20"><Clock className="w-3 h-3" /> Applied</span>;
      case 'shortlisted': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs rounded-full border border-amber-200 dark:border-amber-500/20"><CheckCircle2 className="w-3 h-3" /> Shortlisted</span>;
      case 'hired':
      case 'interview': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold text-xs rounded-full border border-purple-200 dark:border-purple-500/20"><CheckCircle2 className="w-3 h-3" /> Interview</span>;
      case 'selected': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-full border border-emerald-200 dark:border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Selected</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold text-xs rounded-full border border-rose-200 dark:border-rose-500/20"><XCircle className="w-3 h-3" /> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-full border border-zinc-200 dark:border-zinc-700 capitalize">{status}</span>;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
    if (score >= 50) return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20';
    return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20';
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">My Applications</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Track the status of your recent job applications.</p>
      </div>

      {loading ? (
        <MyApplicationsSkeleton count={5} />
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm dark:shadow-none">
          <Briefcase className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No applications yet</h3>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-1">Head over to Open Roles to find your next opportunity.</p>
        </div>
      ) : (
        <>
        {/* Mobile Grid View */}
        <div className="grid md:hidden grid-cols-1 gap-4 mb-4">
          {applications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((app) => (
            <div 
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{app.title}</h3>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">{app.company_name || 'Company'} • {app.job_type}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {app.mcq_score != null ? (
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${app.mcq_passed ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                    Aptitude: {app.mcq_score}%
                  </span>
                ) : app.quiz_id && !app.result_id && new Date() < new Date(app.scheduled_end_time) && app.status === 'shortlisted' ? (
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20">
                    Test Available
                  </span>
                ) : null}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getScoreColor(app.ai_match_score)}`}>
                  AI Match: {app.ai_match_score}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-4 mt-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(app.applied_at).toLocaleDateString()}
                </div>
                <div>{getStatusBadge(app.status)}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role & Company</th>
                  <th className="p-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Applied On</th>
                  <th className="p-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">AI Score</th>
                  <th className="p-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {applications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-blue-100 dark:border-zinc-700">
                          <Briefcase className="w-5 h-5 text-blue-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{app.title}</p>
                            {app.mcq_score != null ? (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${app.mcq_passed ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                                Aptitude: {app.mcq_score}%
                              </span>
                            ) : app.quiz_id && !app.result_id && new Date() < new Date(app.scheduled_end_time) && app.status === 'shortlisted' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20">
                                Test Available
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500">{app.company_name || 'Company'}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">{app.job_type}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                        {new Date(app.applied_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border font-black text-sm ${getScoreColor(app.ai_match_score)}`}>
                        {app.ai_match_score}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {getStatusBadge(app.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {Math.ceil(applications.length / itemsPerPage) > 1 && (
            <div className="px-6 py-5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between bg-white dark:bg-zinc-950">
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Showing <span className="text-zinc-700 dark:text-zinc-300">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-zinc-700 dark:text-zinc-300">{Math.min(currentPage * itemsPerPage, applications.length)}</span> of <span className="text-zinc-700 dark:text-zinc-300">{applications.length}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.ceil(applications.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl text-xs font-black flex items-center justify-center transition-all ${currentPage === page ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-110' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-105'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(applications.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(applications.length / itemsPerPage)}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        </>
      )}

      {/* APPLICATION DETAILS MODAL */}
      {selectedApp && (
        <ApplicationDetailsModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onRevoke={handleRevoke}
          isRevoking={revokeMutation.isPending}
        />
      )}
    </DashboardLayout>
  );
}

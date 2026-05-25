import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { Briefcase, Calendar, CheckCircle2, XCircle, AlertCircle, Clock, X, Trash2, MapPin, FileQuestion, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [testInfo, setTestInfo] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [isAiMatchExpanded, setIsAiMatchExpanded] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      setApplications(response.data.applications);
    } catch (err) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (appId) => {
    if (!window.confirm("Are you sure you want to revoke this application? This action cannot be undone.")) return;
    setIsRevoking(true);
    try {
      await api.delete(`/applications/${appId}/revoke`);
      toast.success("Application revoked successfully");
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to revoke application");
    } finally {
      setIsRevoking(false);
    }
  };

  useEffect(() => {
    if (selectedApp) {
      const s = selectedApp.status?.toLowerCase();
      if (s === 'shortlisted' || s === 'hired' || s === 'rejected' || s === 'applied' || s === 'selected') {
        fetchTestInfo(selectedApp.id);
      } else {
        setTestInfo(null);
      }
    } else {
      setTestInfo(null);
    }
  }, [selectedApp]);

  const fetchTestInfo = async (appId) => {
    setLoadingTest(true);
    setTestInfo(null);
    try {
      const response = await api.get(`/quizzes/application/${appId}/test-info`);
      setTestInfo(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTest(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'applied': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200"><Clock className="w-3 h-3" /> Applied</span>;
      case 'shortlisted': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200"><CheckCircle2 className="w-3 h-3" /> Shortlisted</span>;
      case 'hired':
      case 'interview': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 font-bold text-xs rounded-full border border-purple-200"><CheckCircle2 className="w-3 h-3" /> Interview</span>;
      case 'selected': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Selected</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-full border border-rose-200"><XCircle className="w-3 h-3" /> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 text-slate-700 font-bold text-xs rounded-full border border-slate-200 capitalize">{status}</span>;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Applications</h1>
        <p className="text-slate-500 font-medium mt-1">Track the status of your recent job applications.</p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Role & Company</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Applied On</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">AI Score</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0"></div>
                      <div className="space-y-1">
                        <div className="h-5 w-32 bg-slate-200 rounded"></div>
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
                  <td className="p-4"><div className="w-10 h-10 bg-slate-200 rounded-xl"></div></td>
                  <td className="p-4 text-right"><div className="h-6 w-20 bg-slate-200 rounded-full ml-auto"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No applications yet</h3>
          <p className="text-slate-500 text-sm mt-1">Head over to Open Roles to find your next opportunity.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Role & Company</th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Applied On</th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">AI Score</th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => { setSelectedApp(app); setIsAiMatchExpanded(false); }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                          <Briefcase className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{app.title}</p>
                            {app.mcq_score != null ? (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${app.mcq_passed ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                Aptitude: {app.mcq_score}%
                              </span>
                            ) : app.quiz_id && !app.result_id && new Date() < new Date(app.scheduled_end_time) && app.status === 'shortlisted' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border bg-indigo-50 text-indigo-600 border-indigo-200">
                                Test Available
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium text-slate-500">{app.company_name || 'Company'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-xs font-bold text-slate-400">{app.job_type}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
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
            <div className="flex justify-center items-center gap-2 p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="text-sm font-bold text-slate-600">
                Page {currentPage} of {Math.ceil(applications.length / itemsPerPage)}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(applications.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(applications.length / itemsPerPage)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* APPLICATION DETAILS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedApp(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900">{selectedApp.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-slate-600">{selectedApp.company_name || 'Company'}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedApp.location || 'Remote'}</span>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applied On</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{new Date(selectedApp.applied_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div 
                className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow relative ${getScoreColor(selectedApp.ai_match_score).replace('text-', 'bg-').replace('50', '50/50')}`}
                onClick={() => setIsAiMatchExpanded(!isAiMatchExpanded)}
              >
                <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 bg-white ${getScoreColor(selectedApp.ai_match_score)}`}>
                  <span className="text-[10px] font-black opacity-80 uppercase leading-none mt-1">Score</span>
                  <span className="text-xl font-black leading-none mb-1">{selectedApp.ai_match_score}</span>
                </div>
                <div className="flex-1 pr-6">
                  <p className="text-sm font-bold text-slate-900">AI Compatibility Match</p>
                  <p className={`text-xs font-medium text-slate-600 mt-0.5 whitespace-pre-wrap ${!isAiMatchExpanded ? 'line-clamp-2' : ''}`}>{selectedApp.ai_match_details?.reasoning || 'Your resume is a good match for this position.'}</p>
                </div>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400">
                  {isAiMatchExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* TEST INFO SECTION */}
              {loadingTest ? (
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="w-48 h-5 bg-slate-200 rounded"></div>
                      <div className="w-32 h-4 bg-slate-200 rounded"></div>
                    </div>
                    <div className="w-16 h-6 bg-slate-200 rounded"></div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="w-16 h-3 bg-slate-200 rounded"></div>
                      <div className="w-24 h-4 bg-slate-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-16 h-3 bg-slate-200 rounded"></div>
                      <div className="w-24 h-4 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : testInfo?.quiz ? (
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 flex items-center gap-2"><FileQuestion className="w-4 h-4 text-indigo-500" /> Aptitude Test Scheduled</h4>
                      <p className="text-sm font-bold text-slate-500 mt-0.5">{testInfo.quiz.title} • {testInfo.quiz.duration_minutes} Minutes</p>
                    </div>
                    {testInfo.result?.completed_at ? (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded border border-slate-200">Completed</span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded border border-amber-200">Pending</span>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opens At</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">{new Date(testInfo.quiz.scheduled_start_time).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Closes At</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">{new Date(testInfo.quiz.scheduled_end_time).toLocaleString()}</p>
                    </div>
                  </div>

                  {testInfo.result?.completed_at ? (
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${testInfo.result.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70">Result Score</p>
                        <p className="text-lg font-black">{testInfo.result.score}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{testInfo.result.passed ? 'Passed' : 'Failed'}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/candidate/test/${selectedApp.id}`)}
                      disabled={new Date() < new Date(testInfo.quiz.scheduled_start_time) || new Date() > new Date(testInfo.quiz.scheduled_end_time)}
                      className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {new Date() < new Date(testInfo.quiz.scheduled_start_time) ? 'Test Window Not Open Yet' :
                        new Date() > new Date(testInfo.quiz.scheduled_end_time) ? 'Test Window Closed' : 'Start Aptitude Test'}
                      {(new Date() >= new Date(testInfo.quiz.scheduled_start_time) && new Date() <= new Date(testInfo.quiz.scheduled_end_time)) && <ChevronRight className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              ) : null}

              {(selectedApp.status?.toLowerCase() === 'applied') && (
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleRevoke(selectedApp.id)}
                    disabled={isRevoking}
                    className="px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                  >
                    {isRevoking ? <div className="w-4 h-4 border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div> : <Trash2 className="w-4 h-4" />}
                    Revoke Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

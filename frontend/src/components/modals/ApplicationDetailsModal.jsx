import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, MapPin, ChevronDown, ChevronUp, FileQuestion, ArrowRight, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApplicationDetailsModal({ app, onClose, onRevoke, isRevoking }) {
  const [testInfo, setTestInfo] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [isAiMatchExpanded, setIsAiMatchExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (app) {
      const s = app.status?.toLowerCase();
      if (s === 'shortlisted' || s === 'hired' || s === 'rejected' || s === 'applied' || s === 'selected') {
        fetchTestInfo(app.id);
      } else {
        setTestInfo(null);
      }
    }
  }, [app]);

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

  if (!app) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900">{app.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-slate-600">{app.company_name || 'Company'}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.location || 'Remote'}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
              <div className="mt-1">{getStatusBadge(app.status)}</div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applied On</p>
              <p className="text-sm font-bold text-slate-700 mt-1">{new Date(app.applied_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow relative ${getScoreColor(app.ai_match_score).replace('text-', 'bg-').replace('50', '50/50')}`}
            onClick={() => setIsAiMatchExpanded(!isAiMatchExpanded)}
          >
            <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 bg-white ${getScoreColor(app.ai_match_score)}`}>
              <span className="text-[10px] font-black opacity-80 uppercase leading-none mt-1">Score</span>
              <span className="text-xl font-black leading-none mb-1">{app.ai_match_score}</span>
            </div>
            <div className="flex-1 pr-6">
              <p className="text-sm font-bold text-slate-900">AI Compatibility Match</p>
              <p className={`text-xs font-medium text-slate-600 mt-0.5 whitespace-pre-wrap ${!isAiMatchExpanded ? 'line-clamp-2' : ''}`}>{app.ai_match_details?.reasoning || 'Your resume is a good match for this position.'}</p>
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
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Test Result</p>
                    <p className="text-sm font-bold mt-0.5">{testInfo.result.passed ? 'Passed' : 'Failed'} • Score: {testInfo.result.score}/{testInfo.quiz.total_marks}</p>
                  </div>
                  {testInfo.result.passed ? <CheckCircle2 className="w-6 h-6 opacity-50" /> : <XCircle className="w-6 h-6 opacity-50" />}
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/candidate/applications/${app.id}/test`)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Start Aptitude Test <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : null}

          {/* BOTTOM ACTIONS */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onRevoke(app.id)}
              disabled={isRevoking}
              className="px-4 py-2 text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isRevoking ? 'Revoking...' : 'Revoke Application'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

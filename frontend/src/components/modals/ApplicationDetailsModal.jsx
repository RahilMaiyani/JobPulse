import useEscapeKey from '../../hooks/useEscapeKey';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { X, MapPin, ChevronDown, ChevronUp, FileQuestion, ArrowRight, Trash2, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInterviewByApplication } from '../../hooks/useInterviews';
import { useTestInfo } from '../../hooks/useQuizzes';

export default function ApplicationDetailsModal({ app, onClose, onRevoke, isRevoking }) {
  useEscapeKey(onClose);

  const [isAiMatchExpanded, setIsAiMatchExpanded] = useState(false);
  const navigate = useNavigate();

  const { data: interviewData } = useInterviewByApplication(
    ['interview', 'selected', 'hired'].includes(app?.status?.toLowerCase()) ? app?.id : null
  );

  const shouldFetchTest = app && ['shortlisted', 'hired', 'rejected', 'applied', 'selected'].includes(app.status?.toLowerCase());
  const { data: testInfo, isLoading: loadingTest } = useTestInfo(shouldFetchTest ? app.id : null);


  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
    if (score >= 50) return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20';
    return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20';
  };

  const getTimelineSteps = () => {
    if (!app) return [];
    const s = app.status?.toLowerCase() || 'applied';

    const steps = [
      {
        label: 'Application Submitted',
        description: 'Your resume and AI match score have been sent to HR.',
        date: new Date(app.applied_at).toLocaleString(),
        isCompleted: true,
        isCurrent: s === 'applied'
      }
    ];

    const hasPassedApplied = ['shortlisted', 'interview', 'selected', 'hired'].includes(s) || (s === 'rejected' && testInfo);
    if (hasPassedApplied) {
      steps.push({
        label: 'Shortlisted for Aptitude Test',
        description: 'Your profile stood out! You were selected for the aptitude round.',
        date: testInfo?.quiz ? `Scheduled for ${new Date(testInfo.quiz.scheduled_start_time).toLocaleDateString()}` : '',
        isCompleted: true,
        isCurrent: s === 'shortlisted'
      });
    } else if (s === 'rejected' && !testInfo) {
      steps.push({
        label: 'Application Not Selected',
        description: 'Unfortunately, we are moving forward with other candidates.',
        date: app.updated_at ? new Date(app.updated_at).toLocaleString() : '',
        isCompleted: true,
        isRejected: true,
        isCurrent: true
      });
      return steps;
    }

    const hasPassedShortlisted = ['interview', 'selected', 'hired'].includes(s) || (s === 'rejected' && testInfo?.result?.completed_at);
    if (hasPassedShortlisted) {
      if (testInfo?.result?.passed === false) {
        steps.push({
          label: 'Aptitude Test Failed',
          description: 'Unfortunately, you did not meet the required score for the interview round.',
          date: new Date(testInfo.result.completed_at).toLocaleString(),
          isCompleted: true,
          isRejected: true,
          isCurrent: true
        });
        return steps;
      }

      if (s === 'rejected') {
        steps.push({
          label: 'Interview Round',
          description: 'You completed the aptitude test, but were not selected after the interview.',
          date: app.updated_at ? new Date(app.updated_at).toLocaleString() : '',
          isCompleted: true,
          isRejected: true,
          isCurrent: true
        });
        return steps;
      }

      steps.push({
        label: 'Interview Round',
        description: interviewData
          ? `Your interview is scheduled for ${new Date(interviewData.scheduled_date).toLocaleDateString()} at ${interviewData.scheduled_time}. ${interviewData.notes ? `\nNote: ${interviewData.notes}` : ''}`
          : 'You passed the aptitude test! HR will contact you for an interview.',
        date: interviewData ? `${new Date(interviewData.scheduled_date).toLocaleDateString()} ${interviewData.scheduled_time}` : '',
        isCompleted: ['selected', 'hired'].includes(s),
        isCurrent: s === 'interview'
      });
    }

    if (['selected', 'hired'].includes(s)) {
      steps.push({
        label: 'Hired',
        description: 'Congratulations! You have been selected for this role.',
        date: app.updated_at ? new Date(app.updated_at).toLocaleString() : '',
        isCompleted: true,
        isCurrent: true
      });
    }

    if (s !== 'rejected' && !['selected', 'hired'].includes(s)) {
      if (s === 'applied') {
        steps.push({ label: 'Application Review', isFuture: true });
        steps.push({ label: 'Aptitude Test', isFuture: true });
        steps.push({ label: 'Interview Round', isFuture: true });
      } else if (s === 'shortlisted') {
        steps.push({ label: 'Aptitude Test Evaluation', isFuture: true });
        steps.push({ label: 'Interview Round', isFuture: true });
      } else if (s === 'interview') {
        steps.push({ label: 'Final Decision', isFuture: true });
      }
    }

    return steps;
  };

  if (!app) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[85dvh] flex flex-col">
        <div className="p-4 sm:p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start bg-zinc-50/50 dark:bg-zinc-800/50 shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-100">{app.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{app.company_name || 'Company'}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.location || 'Remote'}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* LEFT COLUMN: TIMELINE UI */}
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-6">Application Tracking</h3>
              <div className="relative pl-4 space-y-6">
                {getTimelineSteps().map((step, idx) => {
                  const allSteps = getTimelineSteps();
                  const hasNextCompleted = allSteps[idx + 1] && (allSteps[idx + 1].isCompleted || allSteps[idx + 1].isCurrent);
                  const hasNextFuture = allSteps[idx + 1] && allSteps[idx + 1].isFuture;
                  const drawLine = idx !== allSteps.length - 1;
                  const lineColor = step.isCompleted && !step.isRejected && hasNextCompleted ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700';

                  return (
                    <div key={idx} className="relative flex items-start gap-5 min-h-[48px]">
                      {drawLine && (
                        <div className={`absolute left-[11px] top-7 bottom-[-24px] w-0.5 ${lineColor}`}></div>
                      )}

                      <div className="relative shrink-0 mt-1 z-10">
                        {step.isRejected ? (
                          <div className="w-6 h-6 rounded-full bg-rose-500 border-[3px] border-white dark:border-zinc-900 flex items-center justify-center shadow-sm">
                            <X className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        ) : step.isCurrent ? (
                          <div className="w-6 h-6 rounded-full bg-indigo-500 border-[3px] border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shadow-sm relative">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                          </div>
                        ) : step.isCompleted ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 border-[3px] border-white dark:border-zinc-900 flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border-[3px] border-white dark:border-zinc-900 shadow-sm flex items-center justify-center">
                            <div className="w-2 h-2 bg-zinc-200 dark:bg-zinc-600 rounded-full"></div>
                          </div>
                        )}
                      </div>

                      <div className={`flex-1 pb-2 ${step.isFuture ? 'opacity-50' : ''}`}>
                        <h4 className={`text-sm font-black ${step.isRejected ? 'text-rose-600 dark:text-rose-400' : step.isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-900 dark:text-zinc-100'}`}>{step.label}</h4>
                        {step.date && <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-widest break-words">{step.date}</p>}
                        {step.description && <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-1 leading-relaxed">{step.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: DETAILS */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-6">Details & Actions</h3>

              <div
                className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow relative ${getScoreColor(app.ai_match_score)}`}
                onClick={() => setIsAiMatchExpanded(!isAiMatchExpanded)}
              >
                <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 bg-white dark:bg-zinc-900 ${getScoreColor(app.ai_match_score)}`}>
                  <span className="text-[10px] font-black opacity-80 uppercase leading-none mt-1">Score</span>
                  <span className="text-xl font-black leading-none mb-1">{app.ai_match_score}</span>
                </div>
                <div className="flex-1 pr-6">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">AI Compatibility Match</p>
                  <p className={`text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-0.5 whitespace-pre-wrap ${!isAiMatchExpanded ? 'line-clamp-2' : ''}`}>{app.ai_match_details?.reasoning || 'Your resume is a good match for this position.'}</p>
                </div>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                  {isAiMatchExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* INTERVIEW DETAILS SECTION */}
              {interviewData && app.status?.toLowerCase() === 'interview' && (
                <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm space-y-4">
                  <h4 className="font-black text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Interview Scheduled
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest">Date</p>
                      <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mt-0.5">{new Date(interviewData.scheduled_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest">Time</p>
                      <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mt-0.5">{interviewData.scheduled_time}</p>
                    </div>
                  </div>
                  {interviewData.notes && (
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest mb-1">Notes</p>
                      <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20">{interviewData.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TEST INFO SECTION */}
              {loadingTest ? (
                <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="w-48 h-5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    </div>
                    <div className="w-16 h-6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-700 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="w-16 h-3 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                      <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-16 h-3 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                      <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : testInfo?.quiz ? (
                <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><FileQuestion className="w-4 h-4 text-indigo-500" /> Aptitude Test Scheduled</h4>
                      <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">{testInfo.quiz.title} • {testInfo.quiz.duration_minutes}m</p>
                    </div>
                    {testInfo.result?.completed_at ? (
                      <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded border border-zinc-200 dark:border-zinc-700">Completed</span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded border border-amber-200 dark:border-amber-500/20">Pending</span>
                    )}
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Opens At</p>
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-0.5 break-words">{new Date(testInfo.quiz.scheduled_start_time).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Closes At</p>
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-0.5 break-words">{new Date(testInfo.quiz.scheduled_end_time).toLocaleString()}</p>
                    </div>
                  </div>

                  {testInfo.result?.completed_at ? (
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${testInfo.result.passed ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'}`}>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Test Result</p>
                        <p className="text-sm font-bold mt-0.5">{testInfo.result.passed ? 'Passed' : 'Failed'} • Score: {testInfo.result.score}/100</p>
                      </div>
                      {testInfo.result.passed ? <CheckCircle2 className="w-6 h-6 opacity-50" /> : <XCircle className="w-6 h-6 opacity-50" />}
                    </div>
                  ) : app.status?.toLowerCase() === 'shortlisted' ? (
                    <button
                      onClick={() => navigate(`/candidate/test/${app.id}`)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Start Aptitude Test <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 rounded-xl text-center text-xs font-semibold border border-zinc-200/60 dark:border-zinc-800/60">
                      Test is not currently active or you are not eligible.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/50 shrink-0">
          <div className="w-full sm:w-auto">
            {app.status?.toLowerCase() === 'applied' && (
              <button
                onClick={() => onRevoke(app.id)}
                disabled={isRevoking}
                className="w-full sm:w-auto justify-center px-4 py-3 sm:py-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isRevoking ? 'Revoking...' : 'Revoke Application'}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    , document.body);
}

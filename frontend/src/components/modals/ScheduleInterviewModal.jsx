import useEscapeKey from '../../hooks/useEscapeKey';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, Clock, Edit3, Send } from 'lucide-react';
import { useApplicationsForJob } from '../../hooks/useApplications';
import { useScheduleInterview, useInterviewsByJob } from '../../hooks/useInterviews';
import toast from 'react-hot-toast';

export default function ScheduleInterviewModal({ job, onClose }) {
  useEscapeKey(onClose);

  const { data: applications = [], isLoading: loadingApps } = useApplicationsForJob(job.id);
  const { data: existingInterviews = [], isLoading: loadingInterviews } = useInterviewsByJob(job.id);
  const scheduleMutation = useScheduleInterview();

  // We only want candidates who have been specifically moved to the 'interview' status
  const candidates = applications.filter(app => {
    return app.status?.toLowerCase() === 'interview';
  });

  const [schedules, setSchedules] = useState({});

  React.useEffect(() => {
    if (existingInterviews.length > 0) {
      const initialSchedules = {};
      existingInterviews.forEach(interview => {
        const timeVal = interview.scheduled_time ? interview.scheduled_time.substring(0, 5) : '';
        const dateVal = interview.scheduled_date ? new Date(interview.scheduled_date).toISOString().split('T')[0] : '';
        
        initialSchedules[interview.application_id] = {
          date: dateVal,
          time: timeVal,
          notes: interview.notes || ''
        };
      });
      setSchedules(prev => ({ ...prev, ...initialSchedules }));
    }
  }, [existingInterviews]);

  const handleUpdateSchedule = (appId, field, value) => {
    setSchedules(prev => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || { date: '', time: '', notes: '' }),
        [field]: value
      }
    }));
  };

  const handleScheduleSubmit = (app) => {
    const data = schedules[app.id];
    if (!data?.date || !data?.time) {
      toast.error('Date and time are required to schedule an interview');
      return;
    }

    scheduleMutation.mutate(
      {
        jobId: job.id,
        applicationId: app.id,
        candidateId: app.user_id,
        scheduledDate: data.date,
        scheduledTime: data.time,
        notes: data.notes || ''
      },
      {
        onSuccess: () => {
          toast.success(`Interview scheduled for ${app.candidate_name}`);
          // Keep it open to schedule others if needed, or update local state to show it's scheduled
        },
        onError: (err) => {
          toast.error(err.response?.data?.error || 'Failed to schedule interview');
        }
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col max-h-[85dvh]">
        
        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Schedule Interviews</h2>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-1">{job.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          {loadingApps || loadingInterviews ? (
              <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500 font-medium">No candidates are currently eligible or shortlisted for an interview.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {candidates.map((app) => {
                const schedule = schedules[app.id] || { date: '', time: '', notes: '' };
                const isAlreadyScheduled = existingInterviews.some(i => i.application_id === app.id);
                return (
                  <div key={app.id} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{app.candidate_name}</h4>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{app.candidate_email}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Date</label>
                            <div className="relative">
                              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                              <input 
                                type="date" 
                                value={schedule.date}
                                onChange={(e) => handleUpdateSchedule(app.id, 'date', e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Time</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                              <input 
                                type="time" 
                                value={schedule.time}
                                onChange={(e) => handleUpdateSchedule(app.id, 'time', e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Interviewer Notes / Link (Optional)</label>
                            <div className="relative">
                              <Edit3 className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                              <textarea 
                                value={schedule.notes}
                                onChange={(e) => handleUpdateSchedule(app.id, 'notes', e.target.value)}
                                placeholder="E.g., Google Meet link, topics to cover..."
                                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium min-h-[60px] focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-end shrink-0 md:w-48 pt-4 md:pt-0">
                        {isAlreadyScheduled && (
                          <div className="mb-3 text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-1 rounded-md inline-block shadow-sm">
                              Last Sent: {new Date(existingInterviews.find(i => i.application_id === app.id).updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        <button 
                          onClick={() => handleScheduleSubmit(app)}
                          disabled={scheduleMutation.isPending}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          {isAlreadyScheduled ? 'Update Schedule' : 'Send Invite'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
    , document.body);
}

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, Calendar, FileText, CheckCircle2, Clock, Users } from 'lucide-react';
import ManageQuizSkeleton from '../skeletons/ManageQuizSkeleton';
import { useQuizForJob } from '../../hooks/useQuizzes';

export default function ManageQuizModal({ job, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    passing_score: 50,
    scheduled_start_time: '',
    scheduled_end_time: ''
  });

  const [questions, setQuestions] = useState([]);
  
  const { data: quizData, isLoading: loading } = useQuizForJob(job.id);

  useEffect(() => {
    if (quizData && quizData.quiz) {
      const q = quizData.quiz;
      const formatDt = (dtStr) => {
        if (!dtStr) return '';
        const d = new Date(dtStr);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      setQuizForm({
        title: q.title || '',
        description: q.description || '',
        duration_minutes: q.duration_minutes || 30,
        passing_score: q.passing_score || 50,
        scheduled_start_time: formatDt(q.scheduled_start_time),
        scheduled_end_time: formatDt(q.scheduled_end_time)
      });
      setQuestions(quizData.questions || []);
    }
  }, [quizData]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_option_index: 0
      }
    ]);
  };

  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleUpdateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!quizForm.title) {
      return toast.error("Quiz title is required");
    }
    if (!quizForm.scheduled_start_time || !quizForm.scheduled_end_time) {
      return toast.error("Start and end times are required");
    }
    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text) return toast.error(`Question ${i + 1} text is required`);
      if (q.options.some(o => !o.trim())) return toast.error(`All options for Question ${i + 1} must be filled`);
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...quizForm,
        scheduled_start_time: new Date(quizForm.scheduled_start_time).toISOString(),
        scheduled_end_time: new Date(quizForm.scheduled_end_time).toISOString(),
        questions
      };
      await api.post(`/quizzes/job/${job.id}`, payload);
      toast.success("Aptitude Test saved successfully!");
      onClose(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save test");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85dvh]">
        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Manage Aptitude Test</h2>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">For {job.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-zinc-50/30 dark:bg-zinc-900">
          {loading ? (
            <ManageQuizSkeleton />
          ) : (
            <div className="space-y-8">
              {/* Quiz Configuration */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">Test Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Test Title *</label>
                    <input
                      type="text"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                      className="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 outline-none"
                      placeholder="e.g., General Aptitude & Reasoning"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Passing Score (%)</label>
                    <input
                      type="number"
                      value={quizForm.passing_score}
                      onChange={(e) => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) })}
                      className="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Scheduled Start Time *</label>
                    <input
                      type="datetime-local"
                      value={quizForm.scheduled_start_time}
                      onChange={(e) => setQuizForm({ ...quizForm, scheduled_start_time: e.target.value })}
                      className="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Scheduled End Time (Deadline) *</label>
                    <input
                      type="datetime-local"
                      value={quizForm.scheduled_end_time}
                      onChange={(e) => setQuizForm({ ...quizForm, scheduled_end_time: e.target.value })}
                      className="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={quizForm.duration_minutes}
                      onChange={(e) => setQuizForm({ ...quizForm, duration_minutes: parseInt(e.target.value) })}
                      className="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 outline-none"
                      placeholder="e.g., 30"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Description / Instructions</label>
                    <textarea
                      value={quizForm.description}
                      onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                      className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 outline-none min-h-[80px]"
                      placeholder="Instructions for the candidates..."
                    />
                  </div>
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">Questions ({questions.length})</h3>
                  <button onClick={handleAddQuestion} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-zinc-300 bg-indigo-50 dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-transparent dark:border-zinc-700">
                    <Plus className="w-4 h-4" /> Add Question
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl">
                    <p className="text-zinc-500 dark:text-zinc-500 font-medium text-sm">No questions added yet. Click "Add Question" to start building your test.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative">
                        <button onClick={() => handleRemoveQuestion(qIndex)} className="absolute top-4 right-4 p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="pr-10 space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Question {qIndex + 1}</label>
                            <textarea
                              value={q.question_text}
                              onChange={(e) => handleUpdateQuestion(qIndex, 'question_text', e.target.value)}
                              className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 outline-none min-h-[80px]"
                              placeholder="Enter the question..."
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, oIndex) => (
                              <div key={oIndex} className={`flex items-center gap-2 p-2 rounded-xl border ${q.correct_option_index === oIndex ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900'}`}>
                                <button
                                  onClick={() => handleUpdateQuestion(qIndex, 'correct_option_index', oIndex)}
                                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${q.correct_option_index === oIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-400'}`}
                                >
                                  {q.correct_option_index === oIndex && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateOption(qIndex, oIndex, e.target.value)}
                                  className="w-full bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none"
                                  placeholder={`Option ${oIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest text-right">Select the circle to mark the correct answer</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-800/50 shrink-0">
          <button onClick={onClose} className="px-6 h-10 font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSubmitting || loading} className="px-6 h-10 font-bold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2">
            {isSubmitting ? <div className="w-4 h-4 border-2 border-zinc-400 dark:border-zinc-500 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></div> : null}
            Save Test
          </button>
        </div>
      </div>
    </div>
    , document.body);
}

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function ManageQuizModal({ job, onClose }) {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchQuiz();
  }, [job.id]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quizzes/job/${job.id}`);
      if (response.data && response.data.quiz) {
        const q = response.data.quiz;
        // Format dates for input[type="datetime-local"]
        const formatDt = (dtStr) => {
          if (!dtStr) return '';
          const d = new Date(dtStr);
          const pad = (n) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };
        setQuizForm({
          title: q.title || '',
          description: q.description || '',
          duration_minutes: q.duration_minutes || 30,
          passing_score: q.passing_score || 50,
          scheduled_start_time: formatDt(q.scheduled_start_time),
          scheduled_end_time: formatDt(q.scheduled_end_time)
        });
        setQuestions(response.data.questions || []);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error("Failed to load quiz details");
      }
    } finally {
      setLoading(false);
    }
  };

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
      toast.error(err.response?.data?.error || "Failed to save quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">Manage Aptitude Test</h2>
            <p className="text-sm font-bold text-slate-500 mt-0.5">For {job.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-50/30">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
          ) : (
            <div className="space-y-10">
              {/* Quiz Configuration */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">Test Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Test Title *</label>
                    <input 
                      type="text" 
                      value={quizForm.title} 
                      onChange={(e) => setQuizForm({...quizForm, title: e.target.value})} 
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                      placeholder="e.g., General Aptitude & Reasoning"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Passing Score (%)</label>
                    <input 
                      type="number" 
                      value={quizForm.passing_score} 
                      onChange={(e) => setQuizForm({...quizForm, passing_score: parseInt(e.target.value)})} 
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Scheduled Start Time *</label>
                    <input 
                      type="datetime-local" 
                      value={quizForm.scheduled_start_time} 
                      onChange={(e) => setQuizForm({...quizForm, scheduled_start_time: e.target.value})} 
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Scheduled End Time (Deadline) *</label>
                    <input 
                      type="datetime-local" 
                      value={quizForm.scheduled_end_time} 
                      onChange={(e) => setQuizForm({...quizForm, scheduled_end_time: e.target.value})} 
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Duration (Minutes)</label>
                    <input 
                      type="number" 
                      value={quizForm.duration_minutes} 
                      onChange={(e) => setQuizForm({...quizForm, duration_minutes: parseInt(e.target.value)})} 
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                      placeholder="e.g., 30"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Description / Instructions</label>
                    <textarea 
                      value={quizForm.description} 
                      onChange={(e) => setQuizForm({...quizForm, description: e.target.value})} 
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none min-h-[80px]"
                      placeholder="Instructions for the candidates..."
                    />
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                  Questions ({questions.length})
                  <button 
                    onClick={handleAddQuestion}
                    className="text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </h3>

                {questions.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-dashed border-slate-300 rounded-2xl">
                    <p className="text-slate-500 font-medium text-sm">No questions added yet. Click "Add Question" to start building your test.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
                        <button onClick={() => handleRemoveQuestion(qIndex)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="pr-10 space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Question {qIndex + 1}</label>
                            <input 
                              type="text" 
                              value={q.question_text} 
                              onChange={(e) => handleUpdateQuestion(qIndex, 'question_text', e.target.value)} 
                              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                              placeholder="Enter the question..."
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, oIndex) => (
                              <div key={oIndex} className={`flex items-center gap-2 p-2 rounded-xl border ${q.correct_option_index === oIndex ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}>
                                <button 
                                  onClick={() => handleUpdateQuestion(qIndex, 'correct_option_index', oIndex)}
                                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${q.correct_option_index === oIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400'}`}
                                >
                                  {q.correct_option_index === oIndex && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                                <input 
                                  type="text" 
                                  value={opt} 
                                  onChange={(e) => handleUpdateOption(qIndex, oIndex, e.target.value)} 
                                  className="w-full bg-transparent text-sm font-medium outline-none"
                                  placeholder={`Option ${oIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right">Select the circle to mark the correct answer</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 shrink-0">
          <button onClick={onClose} className="px-6 h-10 font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSubmitting || loading} className="px-6 h-10 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2">
            {isSubmitting ? <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div> : null}
            Save Test
          </button>
        </div>
      </div>
    </div>
  );
}

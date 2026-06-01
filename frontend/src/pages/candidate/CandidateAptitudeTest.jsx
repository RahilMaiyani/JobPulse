import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Clock, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import AptitudeTestSkeleton from '../../components/skeletons/AptitudeTestSkeleton';
import ConfirmationModal from '../../components/modals/ConfirmationModal';

export default function CandidateAptitudeTest() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [quizDetails, setQuizDetails] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
  
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: true, confirmText: 'Confirm' });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const startTest = async () => {
      try {
        const response = await api.post(`/quizzes/application/${applicationId}/start`);
        if (!isMounted) return;

        const { result, questions: qs, duration_minutes } = response.data;
        
        setQuestions(qs);
        setQuizDetails({ duration_minutes });

        if (result.completed_at) {
          setSubmitted(true);
          setFinalResult(result);
          setLoading(false);
          return;
        }

        // Calculate timer
        const startTime = new Date(result.started_at).getTime();
        const endTime = startTime + duration_minutes * 60000;
        
        const updateTimer = () => {
          const now = Date.now();
          const remMs = endTime - now;
          if (remMs <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimeLeft(0);
            handleAutoSubmit();
          } else {
            setTimeLeft(Math.floor(remMs / 1000));
          }
        };

        updateTimer();
        if (endTime - Date.now() > 0 && isMounted) {
          timerRef.current = setInterval(updateTimer, 1000);
        }
        setLoading(false);
        
      } catch (err) {
        if (!isMounted) return;
        toast.error(err.response?.data?.error || "Failed to start test");
        navigate('/candidate/applications');
      }
    };

    startTest();
    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [applicationId]);

  const handleAutoSubmit = async () => {
    toast("Time's up! Auto-submitting your test...", { icon: '⏳' });
    executeSubmit();
  };

  const handleSubmit = (manual = false) => {
    if (manual) {
      setConfirmModal({
        isOpen: true,
        title: "Submit Test",
        message: "Are you sure you want to submit? You cannot change your answers after submission.",
        confirmText: "Submit Test",
        isDestructive: false,
        onConfirm: () => executeSubmit()
      });
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const response = await api.post(`/quizzes/application/${applicationId}/submit`, { answers });
      setFinalResult(response.data.result);
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success("Test submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit test");
      setIsSubmitting(false);
    } finally {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <AptitudeTestSkeleton />;
  }

  if (submitted && finalResult) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-950 max-w-md w-full rounded-3xl p-8 text-center shadow-xl border border-zinc-200 dark:border-zinc-800">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${finalResult.passed ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
            {finalResult.passed ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-2">Test Completed</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">Your answers have been securely saved and evaluated.</p>
          
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 mb-8 border border-zinc-100 dark:border-zinc-800">
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Your Score</p>
            <p className={`text-5xl font-black tabular-nums ${finalResult.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {finalResult.score}%
            </p>
            <p className={`text-sm font-bold mt-2 ${finalResult.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {finalResult.passed ? 'Passed - Great job!' : 'Did not meet passing criteria'}
            </p>
          </div>

          <button 
            onClick={() => navigate('/candidate/applications')}
            className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col font-sans selection:bg-indigo-100">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Aptitude Test</h1>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Do not refresh the page</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Time Remaining</span>
            <div className={`flex items-center gap-2 text-2xl font-black tabular-nums ${timeLeft < 300 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-zinc-900 dark:text-zinc-100'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <button 
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? <div className="w-4 h-4 border-2 border-zinc-400 dark:border-zinc-600 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></div> : null}
            Submit Test
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm sticky top-28 rounded-2xl">
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = i === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`
                      h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all tabular-nums
                      ${isCurrent ? 'ring-2 ring-indigo-600 dark:ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-950' : ''}
                      ${isAnswered 
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm' 
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}
                    `}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-500 dark:text-zinc-400">Answered:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{answeredCount} / {totalQ}</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                  style={{ width: `${(answeredCount / totalQ) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {currentQ ? (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-10 flex-1 rounded-3xl">
              <div className="mb-8">
                <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
                  Question {currentQuestionIndex + 1} of {totalQ}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 leading-snug whitespace-pre-wrap">
                  {currentQ.question_text}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQ.options.map((opt, oIndex) => {
                  const isSelected = answers[currentQ.id] === oIndex;
                  return (
                    <button
                      key={oIndex}
                      onClick={() => handleSelectOption(currentQ.id, oIndex)}
                      className={`
                        w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group
                        ${isSelected 
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-[0_0_0_4px_rgba(79,70,229,0.1)] dark:shadow-[0_0_0_4px_rgba(99,102,241,0.15)]' 
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                        ${isSelected ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500 text-white' : 'border-zinc-300 dark:border-zinc-700 group-hover:border-indigo-400 dark:group-hover:border-indigo-500'}
                      `}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white dark:bg-zinc-950"></div>}
                      </div>
                      <span className={`text-base font-semibold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm p-10 flex items-center justify-center rounded-3xl">
              <p className="text-zinc-500 dark:text-zinc-400 font-bold">No questions available.</p>
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="h-12 px-6 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-30 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>
            
            {currentQuestionIndex < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQ - 1, prev + 1))}
                className="h-12 px-6 rounded-xl font-bold flex items-center gap-2 bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
              >
                Next Question <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(true)}
                className="h-12 px-8 rounded-xl font-bold flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white shadow-md hover:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
              >
                Submit Final Test
              </button>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        isDestructive={confirmModal.isDestructive}
        confirmText={confirmModal.confirmText}
      />
    </div>
  );
}

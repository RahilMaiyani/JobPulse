import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X, FileText, UploadCloud, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function JobApplicationModal({ job, onClose, onSuccess }) {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [analysisState, setAnalysisState] = useState('idle'); // idle | analyzing | done | error
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes');
      setResumes(response.data.resumes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error("Only PDF files are allowed.");
    if (file.size > 500 * 1024) return toast.error("File is too large. Max 500KB.");

    const formData = new FormData();
    formData.append('resume', file);

    setIsUploadingResume(true);
    try {
      const res = await api.post('/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Resume uploaded!");
      setResumes([res.data.resume, ...resumes]);
      setSelectedResumeId(res.data.resume.id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to upload resume");
    } finally {
      setIsUploadingResume(false);
      e.target.value = '';
    }
  };

  const handleAnalyzeFit = async () => {
    if (!selectedResumeId) return toast.error("Please select a resume first");

    setAnalysisState('analyzing');
    try {
      const res = await api.post('/applications/analyze', {
        jobId: job.id,
        resumeId: selectedResumeId
      });
      setAnalysisResult(res.data.analysis);
      setAnalysisState('done');
    } catch (err) {
      console.error(err);
      setAnalysisState('error');
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Analysis failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleSubmitApplication = async () => {
    if (!selectedResumeId || !analysisResult) return;
    setIsSubmitting(true);
    try {
      await api.post('/applications/submit', {
        jobId: job.id,
        resumeId: selectedResumeId,
        analysis: analysisResult
      });
      toast.success("Application submitted successfully!");
      onSuccess(job.id);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900">Application: {job.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white">
          {/* STEP 1: Select Resume */}
          {analysisState === 'idle' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Select a Resume</h3>
                <p className="text-sm text-slate-500 font-medium">Choose a resume from your vault or upload a new one.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumes.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResumeId(r.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedResumeId === r.id ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <FileText className={`w-6 h-6 mb-2 ${selectedResumeId === r.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <p className="text-sm font-bold text-slate-900 truncate" title={r.file_name}>{r.file_name}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Uploaded {new Date(r.uploaded_at).toLocaleDateString()}</p>
                  </div>
                ))}

                {/* Upload New Card */}
                <label className={`p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col justify-center items-center text-center ${isUploadingResume ? 'border-slate-200 bg-slate-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'}`}>
                  <input type="file" className="hidden" accept="application/pdf" onChange={handleResumeUpload} disabled={isUploadingResume} />
                  {isUploadingResume ? (
                    <div className="w-6 h-6 border-2 border-indigo-400 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                  ) : (
                    <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                  )}
                  <p className="text-sm font-bold text-slate-900">Upload New Resume</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">PDF max 500KB</p>
                </label>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleAnalyzeFit}
                  disabled={!selectedResumeId}
                  className="h-12 px-8 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze AI Fit
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Analyzing Loading State */}
          {analysisState === 'analyzing' && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-50 rounded-full animate-pulse"></div>
                <div className="w-16 h-16 bg-white border border-slate-100 shadow-xl rounded-2xl flex items-center justify-center relative z-10 animate-bounce">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900">Gemini is analyzing your resume...</h3>
              <p className="text-slate-500 font-medium mt-2 max-w-sm">We are cross-referencing your experience and skills with the job requirements. This will just take a moment.</p>
            </div>
          )}

          {/* STEP 3: Results */}
          {analysisState === 'done' && analysisResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {analysisResult.is_suspicious && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">Identity Verification Warning</h4>
                    <p className="text-sm text-rose-700 mt-1">The name or core details on this resume do not seem to match your profile data. You may still apply, but this will be flagged to HR.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6">
                <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center shrink-0 w-full md:w-48 ${getScoreColor(analysisResult.ai_match_score)}`}>
                  <p className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Match Score</p>
                  <h2 className="text-6xl font-black tracking-tighter">{analysisResult.ai_match_score}</h2>
                  <p className="text-xs font-bold mt-2 opacity-80">/ 100 points</p>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strengths
                    </h4>
                    <ul className="space-y-1">
                      {analysisResult.ai_match_details.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-slate-600 font-medium leading-relaxed">• {s}</li>
                      ))}
                    </ul>
                  </div>

                  {analysisResult.ai_match_details.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Areas to Improve
                      </h4>
                      <ul className="space-y-1">
                        {analysisResult.ai_match_details.weaknesses.map((w, i) => (
                          <li key={i} className="text-sm text-slate-600 font-medium leading-relaxed">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-700 italic font-medium">"{analysisResult.ai_match_details.reasoning}"</p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm font-medium text-slate-500">
                  {analysisResult.ai_match_score < 60 ? "Score is a bit low, but you can still shoot your shot!" : "Great match! Submit your application."}
                </p>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setAnalysisState('idle');
                      setAnalysisResult(null);
                    }}
                    className="h-12 px-6 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Try Another Resume
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-12 px-8 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div> : 'Submit Application'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { Briefcase, MapPin, Search, Filter, Clock, X, CheckCircle2, FileText, UploadCloud, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ViewOpenings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  
  // Modals State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // Apply Flow State
  const [resumes, setResumes] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  
  const [analysisState, setAnalysisState] = useState('idle'); // idle | analyzing | done | error
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      setMyApplications(response.data.applications);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      const activeJobs = (response.data.jobs || []).filter(j => j.status === 'active' && j.is_published);
      setJobs(activeJobs);
    } catch (err) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes');
      setResumes(response.data.resumes);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === "All" || job.job_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [jobs, searchTerm, filterType]);

  const openApplyModal = () => {
    setApplyModalOpen(true);
    fetchResumes();
    setSelectedResumeId("");
    setAnalysisState('idle');
    setAnalysisResult(null);
  };

  const closeApplyModal = () => {
    setApplyModalOpen(false);
    setAnalysisState('idle');
    setAnalysisResult(null);
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
        jobId: selectedJob.id,
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
        jobId: selectedJob.id,
        resumeId: selectedResumeId,
        analysis: analysisResult
      });
      toast.success("Application submitted successfully!");
      closeApplyModal();
      setSelectedJob(null);
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
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Open Roles</h1>
        <p className="text-slate-500 font-medium mt-1">Discover your next opportunity within the company.</p>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search roles by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all shadow-sm"
          />
        </div>
        
        <div className="relative shrink-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none h-12 pl-12 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none shadow-sm cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Filter className="w-4 h-4" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location || 'Remote'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.job_type || 'Full-time'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900">
                      {job.salary_min ? `₹${(job.salary_min/1000).toFixed(0)}k+` : 'Competitive'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Salary Range</p>
                  </div>
                  {myApplications.find(a => a.job_id === job.id) ? (
                    <button 
                      disabled
                      className="h-10 px-6 bg-slate-100 text-slate-400 text-sm font-bold rounded-xl whitespace-nowrap cursor-not-allowed"
                    >
                      Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => setSelectedJob(job)}
                      className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md shadow-slate-200 transition-all active:scale-95 whitespace-nowrap"
                    >
                      View Details
                    </button>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No open roles found</h3>
              <p className="text-slate-500 text-sm mt-1">Check back later or try adjusting your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedJob && !applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedJob(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Briefcase className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{selectedJob.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedJob.location || 'Remote'}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{selectedJob.job_type}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {selectedJob.salary_min ? `₹${(selectedJob.salary_min/1000).toFixed(0)}k - ₹${(selectedJob.salary_max/1000).toFixed(0)}k` : 'Competitive Salary'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-black text-slate-900 mb-4">Role Overview</h3>
                <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{selectedJob.description}</p>
                
                {selectedJob.requirements && (
                  <>
                    <div className="w-full h-px bg-slate-100 my-8"></div>
                    <h3 className="text-lg font-black text-slate-900 mb-4">Requirements & Skills</h3>
                    <ul className="space-y-3">
                      {typeof selectedJob.requirements === 'object' && Array.isArray(selectedJob.requirements) 
                        ? selectedJob.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))
                        : <li className="flex items-start gap-3 text-slate-600 font-medium">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{selectedJob.requirements}</span>
                          </li>
                      }
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <div className="text-sm font-bold text-slate-500">
                {selectedJob.application_deadline 
                  ? `Apply before ${new Date(selectedJob.application_deadline).toLocaleDateString()}`
                  : 'Open until filled'}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="px-6 h-12 font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Close
                </button>
                {myApplications.find(a => a.job_id === selectedJob.id) ? (
                  <button 
                    disabled
                    className="px-8 h-12 font-bold text-slate-400 bg-slate-100 rounded-xl flex items-center gap-2 cursor-not-allowed"
                  >
                    Already Applied <CheckCircle2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={openApplyModal}
                    className="px-8 h-12 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
                  >
                    Apply Now <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* APPLY MODAL (Pre-Screening) */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={closeApplyModal}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900">Application: {selectedJob.title}</h2>
              <button onClick={closeApplyModal} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
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
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedResumeId === r.id ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <FileText className={`w-6 h-6 mb-2 ${selectedResumeId === r.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <p className="text-sm font-bold text-slate-900 truncate" title={r.file_name}>{r.file_name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">Uploaded {new Date(r.uploaded_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                    
                    {/* Upload New Card */}
                    <label className={`p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col justify-center items-center text-center ${
                      isUploadingResume ? 'border-slate-200 bg-slate-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                    }`}>
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
                  
                  {/* Suspicion Alert */}
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
                    {/* Score Card */}
                    <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center shrink-0 w-full md:w-48 ${getScoreColor(analysisResult.ai_match_score)}`}>
                      <p className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Match Score</p>
                      <h2 className="text-6xl font-black tracking-tighter">{analysisResult.ai_match_score}</h2>
                      <p className="text-xs font-bold mt-2 opacity-80">/ 100 points</p>
                    </div>

                    {/* Reasoning */}
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
      )}

    </DashboardLayout>
  );
}

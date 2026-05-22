import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { Briefcase, Plus, MoreHorizontal, MapPin, Edit2, Trash2, PowerOff, X, Users, Download, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '', description: '', location: '', job_type: 'Full-time', salary_min: '', salary_max: '', application_deadline: '', requirements: []
  });
  const [reqInput, setReqInput] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Applicants Modal State
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [jobApplicants, setJobApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    fetchJobs();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.jobs || []);
    } catch (err) {
      toast.error("Failed to fetch jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setJobForm({ title: '', description: '', location: '', job_type: 'Full-time', salary_min: '', salary_max: '', application_deadline: '', requirements: [] });
    setReqInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setIsEditMode(true);
    setCurrentJobId(job.id);
    setJobForm({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      job_type: job.job_type || 'Full-time',
      salary_min: job.salary_min || '',
      salary_max: job.salary_max || '',
      application_deadline: job.application_deadline ? new Date(job.application_deadline).toISOString().split('T')[0] : '',
      requirements: job.requirements || []
    });
    setReqInput('');
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/jobs/${currentJobId}`, jobForm);
        toast.success("Job updated successfully!");
      } else {
        await api.post('/jobs', jobForm);
        toast.success("Job posted successfully!");
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (err) {
      toast.error("Failed to delete job");
    }
    setOpenDropdownId(null);
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await api.put(`/jobs/${job.id}`, { status: newStatus });
      toast.success(`Job marked as ${newStatus}`);
      fetchJobs();
    } catch (err) {
      toast.error("Failed to update status");
    }
    setOpenDropdownId(null);
  };

  const handleViewApplicants = async (job) => {
    setSelectedJobForApplicants(job);
    setLoadingApplicants(true);
    setOpenDropdownId(null);
    try {
      const response = await api.get(`/applications/job/${job.id}`);
      setJobApplicants(response.data.applications || []);
    } catch (err) {
      toast.error("Failed to fetch applicants");
    } finally {
      setLoadingApplicants(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Job Listings</h1>
          <p className="text-slate-500 font-medium mt-1">Manage active job postings and applicants.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center h-10 px-4 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-300 transition-all active:scale-95 gap-2"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" ref={dropdownRef}>
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Deadline</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{job.title}</p>
                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {job.location || 'Remote'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-sm text-slate-700">{job.job_type}</td>
                      <td className="px-6 py-4">
                        {job.status === 'active' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-100">
                            Closed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'No Deadline'}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === job.id ? null : job.id)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {/* Action Dropdown */}
                        {openDropdownId === job.id && (
                          <div className="absolute right-6 top-14 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                            <button
                              onClick={() => handleViewApplicants(job)}
                              className="w-full px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                            >
                              <Users className="w-4 h-4 text-indigo-400" /> View Applicants
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button
                              onClick={() => openEditModal(job)}
                              className="w-full px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4 text-slate-400" /> Edit Job
                            </button>
                            <button
                              onClick={() => handleToggleStatus(job)}
                              className="w-full px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <PowerOff className="w-4 h-4 text-slate-400" /> {job.status === 'active' ? 'Close Job' : 'Reopen Job'}
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="w-full px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-rose-400" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      No jobs posted yet. Click "Post New Job" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT JOB MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">{isEditMode ? 'Edit Job' : 'Post New Job'}</h2>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Job Title *</label>
                <input
                  required
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="e.g. Remote, San Francisco"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Job Type</label>
                  <select
                    value={jobForm.job_type}
                    onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Salary Min</label>
                  <input
                    type="number"
                    value={jobForm.salary_min}
                    onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="e.g. 80000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Salary Max</label>
                  <input
                    type="number"
                    value={jobForm.salary_max}
                    onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="e.g. 120000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Application Deadline</label>
                <input
                  type="date"
                  value={jobForm.application_deadline}
                  onChange={(e) => setJobForm({ ...jobForm, application_deadline: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Requirements</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reqInput}
                    onChange={(e) => setReqInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (reqInput.trim()) {
                          setJobForm({ ...jobForm, requirements: [...jobForm.requirements, reqInput.trim()] });
                          setReqInput('');
                        }
                      }
                    }}
                    className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="e.g. 5+ years of React experience"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (reqInput.trim()) {
                        setJobForm({ ...jobForm, requirements: [...jobForm.requirements, reqInput.trim()] });
                        setReqInput('');
                      }
                    }}
                    className="h-10 px-4 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                  >
                    Add
                  </button>
                </div>
                {jobForm.requirements && jobForm.requirements.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {jobForm.requirements.map((req, i) => (
                      <li key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-600">
                        <span>• {req}</span>
                        <button
                          type="button"
                          onClick={() => setJobForm({ ...jobForm, requirements: jobForm.requirements.filter((_, index) => index !== i) })}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Description *</label>
                <textarea
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none min-h-[120px]"
                  placeholder="Job requirements and responsibilities..."
                ></textarea>
              </div>

            </form>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 h-10 font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={isSubmitting}
                className="px-6 h-10 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div> : null}
                {isEditMode ? 'Save Changes' : 'Post Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW APPLICANTS MODAL */}
      {selectedJobForApplicants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedJobForApplicants(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Applicants for {selectedJobForApplicants.title}</h2>
                  <p className="text-sm font-bold text-slate-500 mt-0.5">{jobApplicants.length} total applicants</p>
                </div>
              </div>
              <button onClick={() => setSelectedJobForApplicants(null)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
              {loadingApplicants ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
              ) : jobApplicants.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900">No applicants yet</h3>
                  <p className="text-slate-500 text-sm mt-1">Check back later when candidates start applying.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobApplicants.map((app) => (
                    <div key={app.id} className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 ${getScoreColor(app.ai_match_score)}`}>
                            <span className="text-xs font-black opacity-80 uppercase leading-none mt-1">Score</span>
                            <span className="text-lg font-black leading-none mb-1">{app.ai_match_score}</span>
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                              {app.candidate_name}
                              {app.is_suspicious && (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded border border-rose-200">Suspicious</span>
                              )}
                            </h4>
                            <p className="text-xs font-medium text-slate-500">{app.candidate_email} • Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {app.resume_path && (
                            <a 
                              href={`http://localhost:5000${app.resume_path}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                            >
                              <Download className="w-3.5 h-3.5" /> View Resume
                            </a>
                          )}
                          <select 
                            className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none"
                            defaultValue={app.status}
                          >
                            <option value="Applied">Applied</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hired">Hired</option>
                          </select>
                        </div>
                      </div>

                      {/* AI Details */}
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-black text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Strengths</p>
                          <ul className="space-y-1">
                            {app.ai_match_details?.strengths?.map((s, i) => (
                              <li key={i} className="text-xs text-slate-600 font-medium">• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-black text-amber-600 mb-1 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Weaknesses</p>
                          <ul className="space-y-1">
                            {app.ai_match_details?.weaknesses?.map((w, i) => (
                              <li key={i} className="text-xs text-slate-600 font-medium">• {w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

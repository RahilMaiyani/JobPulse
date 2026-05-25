import React, { useState, useEffect, useRef, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { Briefcase, Plus, MoreHorizontal, MapPin, Edit2, Trash2, PowerOff, X, Users, Download, CheckCircle2, Ban, Search, ChevronDown, ChevronUp, FileQuestion } from 'lucide-react';
import toast from 'react-hot-toast';
import ManageQuizModal from '../../components/admin/ManageQuizModal';
import JobListingsSkeleton from '../../components/skeletons/JobListingsSkeleton';
import JobFormModal from '../../components/modals/JobFormModal';
import JobApplicantsModal from '../../components/modals/JobApplicantsModal';

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Job Search & Filter State
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [jobFilterStatus, setJobFilterStatus] = useState("all"); // all, active, closed

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Manage Quiz State
  const [selectedJobForQuiz, setSelectedJobForQuiz] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Modals State
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);

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
    setJobToEdit(null);
    setIsJobFormOpen(true);
  };

  const openEditModal = (job) => {
    setJobToEdit(job);
    setIsJobFormOpen(true);
    setOpenDropdownId(null);
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

  const handlePublishResults = async (job) => {
    if (!window.confirm("Are you sure you want to publish results? All unattempted tests will be marked as 0 and candidates rejected.")) return;
    try {
      const response = await api.post(`/quizzes/job/${job.id}/publish`);
      toast.success(response.data.message || "Results published successfully");
      fetchJobs(); // refresh to get updated results_published status
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to publish results");
    }
    setOpenDropdownId(null);
  };

  const handleViewApplicants = (job) => {
    setSelectedJobForApplicants(job);
    setOpenDropdownId(null);
  };

  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs];

    if (jobSearchTerm.trim()) {
      const q = jobSearchTerm.toLowerCase();
      result = result.filter(j =>
        (j.title && j.title.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q))
      );
    }

    if (jobFilterStatus !== 'all') {
      result = result.filter(j => j.status === jobFilterStatus);
    }

    result.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return result;
  }, [jobs, jobSearchTerm, jobFilterStatus]);

  const resetJobFilters = () => {
    setJobSearchTerm("");
    setJobFilterStatus("all");
    setCurrentPage(1);
  };

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [jobSearchTerm, jobFilterStatus]);

  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
  const currentJobs = filteredAndSortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
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

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs by title or location..."
            value={jobSearchTerm}
            onChange={(e) => setJobSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <select
          value={jobFilterStatus}
          onChange={(e) => setJobFilterStatus(e.target.value)}
          className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Jobs</option>
          <option value="closed">Closed Jobs</option>
        </select>
        {(jobSearchTerm || jobFilterStatus !== 'all') && (
          <button
            onClick={resetJobFilters}
            className="h-10 px-4 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <JobListingsSkeleton count={5} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm pb-32" ref={dropdownRef}>
          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Type</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hidden sm:table-cell">Deadline</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentJobs.length > 0 ? (
                  currentJobs.map((job, index) => {
                    const isQuizFinished = job.quiz_id && new Date() > new Date(job.scheduled_end_time);
                    return (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Briefcase className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900">{job.title}</p>
                                {job.quiz_id && (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${job.results_published ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : isQuizFinished ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                    {job.results_published ? 'Results Out' : isQuizFinished ? 'Quiz Finished' : 'Quiz Set'}
                                  </span>
                                )}
                              </div>
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
                            <div className={`absolute right-6 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-[60] animate-in fade-in zoom-in-95 duration-100 text-left top-14`}>
                              <button
                                onClick={() => handleViewApplicants(job)}
                                className="w-full px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                              >
                                <Users className="w-4 h-4 text-indigo-400" /> View {job.results_published ? 'Results & Applicants' : 'Applicants'}
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

                              {!job.results_published ? (
                                <button
                                  onClick={() => { setOpenDropdownId(null); setSelectedJobForQuiz(job); }}
                                  className="w-full px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <FileQuestion className="w-4 h-4 text-slate-400" /> Manage Aptitude Test
                                </button>
                              ) : null}

                              {isQuizFinished && !job.results_published && (
                                <button
                                  onClick={() => handlePublishResults(job)}
                                  className="w-full px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Publish Results
                                </button>
                              )}

                              <div className="h-px bg-slate-100 my-1"></div>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="w-full px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4 text-rose-400" /> Delete Job
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
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
      {isJobFormOpen && (
        <JobFormModal
          job={jobToEdit}
          onClose={() => setIsJobFormOpen(false)}
          onSuccess={() => {
            setIsJobFormOpen(false);
            fetchJobs();
          }}
        />
      )}

      {/* VIEW APPLICANTS MODAL */}
      {selectedJobForApplicants && (
        <JobApplicantsModal
          job={selectedJobForApplicants}
          onClose={() => setSelectedJobForApplicants(null)}
        />
      )}

      {/* MANAGE QUIZ MODAL */}
      {selectedJobForQuiz && (
        <ManageQuizModal
          job={selectedJobForQuiz}
          onClose={(shouldRefresh) => {
            setSelectedJobForQuiz(null);
            if (shouldRefresh === true) {
              fetchJobs();
            }
          }}
        />
      )}

    </DashboardLayout>
  );
}

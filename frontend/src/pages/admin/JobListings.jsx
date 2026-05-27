import React, { useState, useEffect, useRef, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useJobs, useDeleteJob, useToggleJobStatus, usePublishJobResults } from '../../hooks/useJobs';
import { useQueryClient } from '@tanstack/react-query';
import { Briefcase, Plus, MoreHorizontal, MapPin, Edit2, Trash2, PowerOff, X, Users, Download, CheckCircle2, Ban, Search, ChevronDown, ChevronUp, FileQuestion, Calendar, LayoutGrid, List, CircleDollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import ManageQuizModal from '../../components/admin/ManageQuizModal';
import JobListingsSkeleton from '../../components/skeletons/JobListingsSkeleton';
import JobFormModal from '../../components/modals/JobFormModal';
import JobApplicantsModal from '../../components/modals/JobApplicantsModal';
import ScheduleInterviewModal from '../../components/modals/ScheduleInterviewModal';

export default function JobListings() {
  const queryClient = useQueryClient();

  // Job Search & Filter State
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [jobFilterStatus, setJobFilterStatus] = useState("all"); // all, active, closed
  const [viewMode, setViewMode] = useState("grid"); // grid, list

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
  const [selectedJobForInterviews, setSelectedJobForInterviews] = useState(null);

  const { data: jobs = [], isLoading: loading } = useJobs();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openCreateModal = () => {
    setJobToEdit(null);
    setIsJobFormOpen(true);
  };

  const openEditModal = (job) => {
    setJobToEdit(job);
    setIsJobFormOpen(true);
    setOpenDropdownId(null);
  };

  const deleteJobMutation = useDeleteJob();

  const handleDeleteJob = (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    deleteJobMutation.mutate(id);
    setOpenDropdownId(null);
  };

  const toggleStatusMutation = useToggleJobStatus();

  const handleToggleStatus = (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    toggleStatusMutation.mutate({ id: job.id, newStatus });
    setOpenDropdownId(null);
  };

  const publishResultsMutation = usePublishJobResults();

  const handlePublishResults = (job) => {
    if (!window.confirm("Are you sure you want to publish results? All unattempted tests will be marked as 0 and candidates rejected.")) return;
    publishResultsMutation.mutate(job.id);
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Job Listings</h1>
          <p className="text-slate-500 dark:text-zinc-400 font-medium mt-1">Manage active job postings and applicants.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center h-10 px-4 font-bold text-white bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-white rounded-xl shadow-lg shadow-slate-300 dark:shadow-none transition-all active:scale-95 gap-2"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search jobs by title or location..."
            value={jobSearchTerm}
            onChange={(e) => setJobSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 dark:focus:ring-zinc-700 dark:focus:border-zinc-700 outline-none"
          />
        </div>
        <select
          value={jobFilterStatus}
          onChange={(e) => setJobFilterStatus(e.target.value)}
          className="h-10 px-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-slate-700 dark:text-zinc-300 outline-none cursor-pointer focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-700"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Jobs</option>
          <option value="closed">Closed Jobs</option>
        </select>
        {(jobSearchTerm || jobFilterStatus !== 'all') && (
          <button
            onClick={resetJobFilters}
            className="h-10 px-4 text-sm font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-800 bg-slate-100 dark:bg-zinc-800/50 rounded-xl transition-colors shrink-0"
          >
            Clear Filters
          </button>
        )}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-800/50 p-1 rounded-xl border border-slate-200/50 dark:border-zinc-800 shrink-0 h-10 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm border border-slate-200/10 dark:border-zinc-700/50' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm border border-slate-200/10 dark:border-zinc-700/50' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <JobListingsSkeleton count={6} viewMode={viewMode} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
          {currentJobs.length > 0 ? (
            currentJobs.map((job) => {
              const isQuizFinished = job.quiz_id && new Date() > new Date(job.scheduled_end_time);
              const isDeadlinePassed = job.application_deadline && new Date(job.application_deadline) < new Date();
              
              const formatSalary = (min, max) => {
                if (min && max) {
                  return `₹${(min/1000).toFixed(0)}k - ₹${(max/1000).toFixed(0)}k / mo`;
                }
                if (min) {
                  return `₹${(min/1000).toFixed(0)}k+ / mo`;
                }
                return 'Competitive';
              };

              const isActive = job.status === 'active';

              return (
                <div 
                  key={job.id} 
                  className={`border border-slate-200 dark:border-zinc-800 border-l-4 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between relative group h-[290px] ${
                    isActive 
                      ? 'bg-white dark:bg-zinc-900 border-l-emerald-500 dark:border-l-emerald-500 hover:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700/80' 
                      : 'bg-slate-50/50 dark:bg-zinc-900/40 border-l-slate-300 dark:border-l-zinc-700/85 opacity-70 grayscale-[10%] hover:opacity-90 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform duration-300 ${
                          isActive 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-slate-100 dark:bg-zinc-800 border-slate-200/50 dark:border-zinc-700/50 text-slate-400 dark:text-zinc-500'
                        }`}>
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 
                            onClick={() => handleViewApplicants(job)}
                            className="font-bold text-base text-slate-900 dark:text-zinc-50 leading-snug hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer line-clamp-1 transition-colors"
                            title={job.title}
                          >
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/50 dark:border-zinc-700/50">
                              {job.job_type}
                            </span>
                            {isActive ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                                Closed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Toggle */}
                      <div className="relative">
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === job.id ? null : job.id); }}
                          className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {/* Action Dropdown */}
                        {openDropdownId === job.id && (
                          <div ref={dropdownRef} className="absolute right-0 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-200 dark:border-zinc-800 py-2 z-[60] animate-in fade-in zoom-in-95 duration-100 text-left mt-1">
                            <button
                              onClick={() => handleViewApplicants(job)}
                              className="w-full px-4 py-2 text-sm font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                            >
                              <Users className="w-4 h-4 text-indigo-400" /> View {job.results_published ? 'Results & Applicants' : 'Applicants'}
                            </button>
                            {job.results_published && job.status === 'active' && (
                              <button
                                onClick={() => { setOpenDropdownId(null); setSelectedJobForInterviews(job); }}
                                className="w-full px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                              >
                                <Calendar className="w-4 h-4 text-emerald-500" /> Schedule Interviews
                              </button>
                            )}
                            <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1"></div>
                            <button
                              onClick={() => openEditModal(job)}
                              className="w-full px-4 py-2 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4 text-slate-400 dark:text-zinc-500" /> Edit Job
                            </button>
                            <button
                              onClick={() => handleToggleStatus(job)}
                              className="w-full px-4 py-2 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                            >
                              <PowerOff className="w-4 h-4 text-slate-400 dark:text-zinc-500" /> {job.status === 'active' ? 'Close Job' : 'Reopen Job'}
                            </button>

                            {!job.results_published ? (
                              <button
                                onClick={() => { setOpenDropdownId(null); setSelectedJobForQuiz(job); }}
                                className="w-full px-4 py-2 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                              >
                                <FileQuestion className="w-4 h-4 text-slate-400 dark:text-zinc-500" /> Manage Aptitude Test
                              </button>
                            ) : null}

                            {isQuizFinished && !job.results_published && (
                              <button
                                onClick={() => handlePublishResults(job)}
                                className="w-full px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Publish Results
                              </button>
                            )}

                            <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1"></div>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="w-full px-4 py-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-rose-400" /> Delete Job
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="space-y-2.5 pt-1 text-slate-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <MapPin className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                        <span>{job.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <CircleDollarSign className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                        <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs font-medium ${isDeadlinePassed ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                        <Calendar className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                        <span>
                          {job.application_deadline ? `Deadline: ${new Date(job.application_deadline).toLocaleDateString()}` : 'No Deadline'}
                          {isDeadlinePassed && ' (Passed)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Users className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                        <span>
                          {job.applicant_count || 0} {job.applicant_count === 1 ? 'Applicant' : 'Applicants'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Row Actions */}
                  <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-4 flex items-center justify-between gap-3">
                    {job.quiz_id && job.status === 'active' ? (
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${job.results_published ? (Number(job.unscheduled_count) > 0 ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20') : isQuizFinished ? 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'}`}>
                        {job.results_published ? (Number(job.unscheduled_count) > 0 ? 'Ready to Schedule' : 'Interviews Scheduled') : isQuizFinished ? 'Quiz Finished' : 'Quiz Set'}
                      </span>
                    ) : (
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-widest">
                        Aptitude test info
                      </div>
                    )}

                    <div className="flex gap-2">
                      {job.results_published && job.status === 'active' && (
                        <button
                          onClick={() => setSelectedJobForInterviews(job)}
                          className="h-8 px-3 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 bg-emerald-50/50 dark:bg-zinc-900 border border-emerald-200/50 dark:border-emerald-500/20 rounded-xl transition-all"
                        >
                          Schedule
                        </button>
                      )}
                      <button
                        onClick={() => handleViewApplicants(job)}
                        className="h-8 px-3 text-[11px] font-black text-white dark:text-zinc-950 bg-slate-900 dark:bg-zinc-50 hover:bg-slate-800 dark:hover:bg-white rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <span>View Applicants</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 dark:text-zinc-500 font-medium bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
              No jobs posted yet. Click "Post New Job" to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none pb-32">
          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest hidden md:table-cell">Type</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest hidden sm:table-cell">Deadline</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {currentJobs.length > 0 ? (
                  currentJobs.map((job) => {
                    const isQuizFinished = job.quiz_id && new Date() > new Date(job.scheduled_end_time);
                    const isActive = job.status === 'active';
                    return (
                      <tr 
                        key={job.id} 
                        className={`transition-colors group ${
                          isActive 
                            ? 'hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 text-slate-900 dark:text-zinc-100' 
                            : 'opacity-60 grayscale-[10%] hover:opacity-80 text-slate-500 dark:text-zinc-400 bg-slate-50/5 dark:bg-zinc-900/5'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                              isActive 
                                ? 'bg-slate-100 dark:bg-zinc-800 border-slate-200/50 dark:border-zinc-700/50 text-slate-600 dark:text-zinc-400' 
                                : 'bg-slate-200/40 dark:bg-zinc-800/30 border-slate-200/20 dark:border-zinc-700/20 text-slate-400 dark:text-zinc-500'
                            }`}>
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`font-bold ${isActive ? 'text-slate-900 dark:text-zinc-100' : 'text-slate-500 dark:text-zinc-400'}`}>{job.title}</p>
                                {job.quiz_id && isActive && (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${job.results_published ? (Number(job.unscheduled_count) > 0 ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20') : isQuizFinished ? 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'}`}>
                                    {job.results_published ? (Number(job.unscheduled_count) > 0 ? 'Ready to Schedule' : 'Interviews Scheduled') : isQuizFinished ? 'Quiz Finished' : 'Quiz Set'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-medium text-slate-500 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {job.location || 'Remote'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-sm text-slate-700 dark:text-zinc-300">{job.job_type}</td>
                        <td className="px-6 py-4">
                          {job.status === 'active' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                              Closed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-zinc-400">
                          {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'No Deadline'}
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === job.id ? null : job.id); }}
                            className="p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {/* Action Dropdown */}
                          {openDropdownId === job.id && (
                            <div ref={dropdownRef} className="absolute right-6 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-200 dark:border-zinc-800 py-2 z-[60] animate-in fade-in zoom-in-95 duration-100 text-left top-14">
                              <button
                                onClick={() => handleViewApplicants(job)}
                                className="w-full px-4 py-2 text-sm font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                              >
                                <Users className="w-4 h-4 text-indigo-400" /> View {job.results_published ? 'Results & Applicants' : 'Applicants'}
                              </button>
                              {job.results_published && job.status === 'active' && (
                                <button
                                  onClick={() => { setOpenDropdownId(null); setSelectedJobForInterviews(job); }}
                                  className="w-full px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <Calendar className="w-4 h-4 text-emerald-500" /> Schedule Interviews
                                </button>
                              )}
                              <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1"></div>
                              <button
                                onClick={() => openEditModal(job)}
                                className="w-full px-4 py-2 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4 text-slate-400 dark:text-zinc-500" /> Edit Job
                              </button>
                              <button
                                onClick={() => handleToggleStatus(job)}
                                className="w-full px-4 py-2 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                              >
                                <PowerOff className="w-4 h-4 text-slate-400 dark:text-zinc-500" /> {job.status === 'active' ? 'Close Job' : 'Reopen Job'}
                              </button>

                              {!job.results_published ? (
                                <button
                                  onClick={() => { setOpenDropdownId(null); setSelectedJobForQuiz(job); }}
                                  className="w-full px-4 py-2 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <FileQuestion className="w-4 h-4 text-slate-400 dark:text-zinc-500" /> Manage Aptitude Test
                                </button>
                              ) : null}

                              {isQuizFinished && !job.results_published && (
                                <button
                                  onClick={() => handlePublishResults(job)}
                                  className="w-full px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Publish Results
                                </button>
                              )}

                              <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1"></div>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="w-full px-4 py-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-800 flex items-center gap-2"
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
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-zinc-500 font-medium">
                      No jobs posted yet. Click "Post New Job" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-zinc-800/80 pt-6 mt-4 pb-12">
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Showing <span className="font-bold text-slate-800 dark:text-zinc-200">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedJobs.length)}
            </span>{' '}
            of <span className="font-bold text-slate-800 dark:text-zinc-200">{filteredAndSortedJobs.length}</span> jobs
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-9 px-4 text-sm font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-800/60 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors border border-slate-200/20 dark:border-zinc-700/30 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-9 px-4 text-sm font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-800/60 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors border border-slate-200/20 dark:border-zinc-700/30 cursor-pointer"
            >
              Next
            </button>
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
            queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
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
              queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
            }
          }}
        />
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {selectedJobForInterviews && (
        <ScheduleInterviewModal
          job={selectedJobForInterviews}
          onClose={() => setSelectedJobForInterviews(null)}
        />
      )}

    </DashboardLayout>
  );
}

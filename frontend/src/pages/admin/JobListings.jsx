import React, { useState, useEffect, useRef, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useJobs, useDeleteJob, useToggleJobStatus, usePublishJobResults } from '../../hooks/useJobs';
import { useQueryClient } from '@tanstack/react-query';
import { Briefcase, Plus, MoreHorizontal, MapPin, Edit2, Trash2, PowerOff, X, Users, Download, CheckCircle2, Ban, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileQuestion, Calendar, LayoutGrid, List, CircleDollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import ManageQuizModal from '../../components/admin/ManageQuizModal';
import JobListingsSkeleton from '../../components/skeletons/JobListingsSkeleton';
import JobFormModal from '../../components/modals/JobFormModal';
import JobApplicantsModal from '../../components/modals/JobApplicantsModal';
import ScheduleInterviewModal from '../../components/modals/ScheduleInterviewModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';

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
  const gridDropdownRef = useRef(null);
  const listDropdownRef = useRef(null);

  // Modals State
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [selectedJobForInterviews, setSelectedJobForInterviews] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: true, confirmText: 'Confirm' });

  const { data: jobs = [], isLoading: loading } = useJobs();

  useEffect(() => {
    const handleClickOutside = (event) => {
      const inGrid = gridDropdownRef.current && gridDropdownRef.current.contains(event.target);
      const inList = listDropdownRef.current && listDropdownRef.current.contains(event.target);
      if (!inGrid && !inList) {
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
    setConfirmModal({
      isOpen: true,
      title: "Delete Job",
      message: "Are you sure you want to delete this job? This action cannot be undone.",
      confirmText: "Delete",
      isDestructive: true,
      onConfirm: () => {
        deleteJobMutation.mutate(id);
        setOpenDropdownId(null);
      }
    });
  };

  const toggleStatusMutation = useToggleJobStatus();

  const handleToggleStatus = (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    toggleStatusMutation.mutate({ id: job.id, newStatus });
    setOpenDropdownId(null);
  };

  const publishResultsMutation = usePublishJobResults();

  const handlePublishResults = (job) => {
    setConfirmModal({
      isOpen: true,
      title: "Publish Results",
      message: "Are you sure you want to publish results? All unattempted tests will be marked as 0 and candidates rejected.",
      confirmText: "Publish",
      isDestructive: false,
      onConfirm: () => {
        publishResultsMutation.mutate(job.id);
        setOpenDropdownId(null);
      }
    });
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
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Job Listings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2 text-sm">Manage active job postings and applicants.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center h-12 px-6 font-black text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white rounded-2xl shadow-xl shadow-zinc-200 dark:shadow-none transition-all active:scale-95 hover:-translate-y-0.5 gap-2 duration-300 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search jobs by title or location..."
            value={jobSearchTerm}
            onChange={(e) => setJobSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm dark:shadow-none transition-all"
          />
        </div>
        <select
          value={jobFilterStatus}
          onChange={(e) => setJobFilterStatus(e.target.value)}
          className="h-12 px-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm dark:shadow-none transition-all cursor-pointer appearance-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Jobs</option>
          <option value="closed">Closed Jobs</option>
        </select>
        {(jobSearchTerm || jobFilterStatus !== 'all') && (
          <button
            onClick={resetJobFilters}
            className="h-12 px-4 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl transition-colors shrink-0 active:scale-95"
          >
            Clear Filters
          </button>
        )}
        <div className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shrink-0 h-12 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 scale-105' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:scale-105'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 scale-105' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:scale-105'}`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <JobListingsSkeleton count={6} viewMode={viewMode} />
      ) : (
        <>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32 ${viewMode === 'list' ? 'md:hidden' : ''}`}>
            {currentJobs.length > 0 ? (
              currentJobs.map((job) => {
                const isQuizFinished = job.quiz_id && new Date() > new Date(job.scheduled_end_time);
                const isDeadlinePassed = job.application_deadline && new Date(job.application_deadline) < new Date();

                const formatSalary = (min, max) => {
                  if (min && max) {
                    return `₹${(min / 1000).toFixed(0)}k - ₹${(max / 1000).toFixed(0)}k / mo`;
                  }
                  if (min) {
                    return `₹${(min / 1000).toFixed(0)}k+ / mo`;
                  }
                  return 'Competitive';
                };

                const isActive = job.status === 'active';
                const isMenuOpen = openDropdownId === job.id;

                return (
                  <div
                    key={job.id}
                    className={`border-l-4 rounded-[2rem] p-6 transition-all duration-300 flex flex-col justify-between relative group h-[290px] ${isMenuOpen
                      ? 'ring-2 ring-zinc-800 dark:ring-zinc-100 shadow-xl scale-[1.02] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-zinc-300 dark:border-zinc-700 z-10'
                      : 'border-zinc-200/60 dark:border-zinc-800/60 border-t border-r border-b'
                      } ${isActive
                        ? 'bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-l-emerald-500 dark:border-l-emerald-500 hover:shadow-xl hover:bg-white dark:hover:bg-zinc-900 hover:-translate-y-1'
                        : 'bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-sm border-l-zinc-300/50 dark:border-l-zinc-700/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50'
                      }`}
                  >
                    <div className="space-y-4">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform duration-300 ${isActive
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200/50 dark:border-zinc-700/50 text-zinc-400 dark:text-zinc-500'
                            }`}>
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <h3
                              onClick={() => handleViewApplicants(job)}
                              className={`font-bold text-base leading-snug hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer line-clamp-1 transition-colors ${isActive ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-450 dark:text-zinc-400 font-semibold'
                                }`}
                              title={job.title}
                            >
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
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
                            className={`p-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer ${isMenuOpen
                              ? 'text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-zinc-200/30 dark:border-zinc-700'
                              : 'text-zinc-500 dark:text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {/* Action Dropdown */}
                          {openDropdownId === job.id && (
                            <div ref={gridDropdownRef} className="absolute right-0 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-[60] animate-in fade-in zoom-in-95 duration-100 text-left mt-1">
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
                              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                              <button
                                onClick={() => openEditModal(job)}
                                className="w-full px-4 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> Edit Job
                              </button>
                              <button
                                onClick={() => handleToggleStatus(job)}
                                className="w-full px-4 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                              >
                                <PowerOff className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> {job.status === 'active' ? 'Close Job' : 'Reopen Job'}
                              </button>

                              {!job.results_published ? (
                                <button
                                  onClick={() => { setOpenDropdownId(null); setSelectedJobForQuiz(job); }}
                                  className="w-full px-4 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <FileQuestion className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> Manage Aptitude Test
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

                              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
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
                      <div className={`space-y-2.5 pt-1 transition-colors ${isActive ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-500 font-medium'
                        }`}>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <MapPin className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                          <span>{job.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <CircleDollarSign className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                          <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs font-medium ${isDeadlinePassed ? 'text-rose-600 dark:text-rose-450 font-semibold   ' : ''}`}>
                          <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                          <span>
                            {job.application_deadline ? `Deadline: ${new Date(job.application_deadline).toLocaleDateString()}` : 'No Deadline'}
                            {isDeadlinePassed && ' (Passed)'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Users className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                          <span>
                            {job.applicant_count || 0} {job.applicant_count === 1 ? 'Applicant' : 'Applicants'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row Actions */}
                    <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex items-center justify-between gap-3">
                      {job.quiz_id && job.status === 'active' ? (
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${job.results_published ? (Number(job.unscheduled_count) > 0 ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20') : isQuizFinished ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'}`}>
                          {job.results_published ? (Number(job.unscheduled_count) > 0 ? 'Ready to Schedule' : 'Interviews Scheduled') : isQuizFinished ? 'Ready to Publish' : 'Quiz Set'}
                        </span>
                      ) : (
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-widest text-center">
                          Aptitude test info
                        </div>
                      )}

                      <div className="flex gap-2 shrink-0">
                        {isQuizFinished && !job.results_published && job.status === 'active' && (
                          <button
                            onClick={() => handlePublishResults(job)}
                            className="h-8 px-3 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 bg-emerald-50/50 dark:bg-zinc-900 border border-emerald-200/50 dark:border-emerald-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                          </button>
                        )}
                        {job.results_published && job.status === 'active' && (
                          <button
                            onClick={() => setSelectedJobForInterviews(job)}
                            className="h-8 px-3 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 bg-emerald-50/50 dark:bg-zinc-900 border border-emerald-200/50 dark:border-emerald-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Schedule
                          </button>
                        )}
                        <button
                          onClick={() => handleViewApplicants(job)}
                          className={`h-8 px-3 text-[11px] font-black rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${isActive
                            ? 'text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-white'
                            : 'text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/50 dark:border-zinc-700/50'
                            }`}
                        >
                          <span>View Applicants</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center text-zinc-500 dark:text-zinc-500 font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                No jobs posted yet. Click "Post New Job" to get started.
              </div>
            )}
          </div>
          <div className={`bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-none rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden pb-4 mb-32 hidden ${viewMode === 'list' ? 'md:block' : ''}`}>
            <div className="w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800/60">
                    <th className="px-6 py-5 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-5 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest hidden md:table-cell">Type</th>
                    <th className="px-6 py-5 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest hidden sm:table-cell">Deadline</th>
                    <th className="px-6 py-5 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {currentJobs.length > 0 ? (
                    currentJobs.map((job) => {
                      const isQuizFinished = job.quiz_id && new Date() > new Date(job.scheduled_end_time);
                      const isActive = job.status === 'active';
                      const isMenuOpen = openDropdownId === job.id;
                      return (
                        <tr
                          key={job.id}
                          className={`transition-all duration-300 group border-b border-zinc-50 dark:border-zinc-800/40 ${isMenuOpen
                            ? 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-50 shadow-inner scale-[1.01] z-10 relative rounded-xl'
                            : isActive
                              ? 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:shadow-md'
                              : 'bg-zinc-50/30 dark:bg-zinc-900/20 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 opacity-80 hover:opacity-100'
                            }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${isActive
                                ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400'
                                : 'bg-zinc-200/40 dark:bg-zinc-800/30 border-zinc-200/20 dark:border-zinc-700/20 text-zinc-400 dark:text-zinc-500'
                                }`}>
                                <Briefcase className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className={`font-bold ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-405'}`}>{job.title}</p>
                                  {job.quiz_id && isActive && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${job.results_published ? (Number(job.unscheduled_count) > 0 ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20') : isQuizFinished ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'}`}>
                                      {job.results_published ? (Number(job.unscheduled_count) > 0 ? 'Ready to Schedule' : 'Interviews Scheduled') : isQuizFinished ? 'Ready to Publish' : 'Quiz Set'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3" /> {job.location || 'Remote'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 font-medium text-sm ${isActive ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-450 dark:text-zinc-550'}`}>{job.job_type}</td>
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
                          <td className={`px-6 py-4 text-sm font-medium ${isActive ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-450 dark:text-zinc-550'}`}>
                            {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'No Deadline'}
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === job.id ? null : job.id); }}
                              className={`p-2 rounded-lg transition-colors focus:outline-none cursor-pointer ${isMenuOpen
                                ? 'text-zinc-900 dark:text-zinc-50 bg-zinc-200/80 dark:bg-zinc-700/80 shadow-sm border border-zinc-300/50 dark:border-zinc-650'
                                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>

                            {/* Action Dropdown */}
                            {openDropdownId === job.id && (
                              <div ref={listDropdownRef} className="absolute right-6 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-[60] animate-in fade-in zoom-in-95 duration-100 text-left top-14">
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
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                                <button
                                  onClick={() => openEditModal(job)}
                                  className="w-full px-4 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <Edit2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> Edit Job
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(job)}
                                  className="w-full px-4 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <PowerOff className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> {job.status === 'active' ? 'Close Job' : 'Reopen Job'}
                                </button>

                                {!job.results_published ? (
                                  <button
                                    onClick={() => { setOpenDropdownId(null); setSelectedJobForQuiz(job); }}
                                    className="w-full px-4 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                  >
                                    <FileQuestion className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> Manage Aptitude Test
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

                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
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
                      <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-500 font-medium">
                        No jobs posted yet. Click "Post New Job" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-200/60 dark:border-zinc-800/60 pt-6 mt-6 pb-12 gap-4">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
            Showing <span className="font-black text-zinc-800 dark:text-zinc-200">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-black text-zinc-800 dark:text-zinc-200">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedJobs.length)}
            </span>{' '}
            of <span className="font-black text-zinc-800 dark:text-zinc-200">{filteredAndSortedJobs.length}</span> jobs
          </p>
          <div className="flex gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-10 px-5 text-sm font-black text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-800 disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm disabled:shadow-none hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-10 px-5 text-sm font-black text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-800 disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm disabled:shadow-none hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
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

      <ConfirmationModal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        isDestructive={confirmModal.isDestructive}
        confirmText={confirmModal.confirmText}
      />
    </DashboardLayout>
  );
}
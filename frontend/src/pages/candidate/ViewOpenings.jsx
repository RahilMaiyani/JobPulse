import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useActiveJobs } from '../../hooks/useJobs';
import { useMyApplications, useApplyForJob } from '../../hooks/useApplications';
import ViewOpeningsSkeleton from '../../components/skeletons/ViewOpeningsSkeleton';
import JobDetailsModal from '../../components/modals/JobDetailsModal';
import JobApplicationModal from '../../components/modals/JobApplicationModal';
import { Search, Filter, Briefcase, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ViewOpenings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const queryClient = useQueryClient();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const { data: myApplications = [], isLoading: isLoadingApps } = useMyApplications();
  const { data: jobs = [], isLoading: isLoadingJobs } = useActiveJobs();

  const loading = isLoadingApps || isLoadingJobs;

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const isExpired = job.application_deadline && new Date(job.application_deadline) < new Date(new Date().setHours(0, 0, 0, 0));
      const appliedApp = myApplications.find(a => a.job_id === job.id);
      
      if (isExpired && !appliedApp) {
        return false;
      }

      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === "All" || job.job_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [jobs, searchTerm, filterType, myApplications]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const currentJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openApplyModal = () => {
    setApplyModalOpen(true);
  };

  const closeApplyModal = () => {
    setApplyModalOpen(false);
  };

  const handleApplicationSuccess = (jobId) => {
    queryClient.invalidateQueries({ queryKey: ['applications', 'my'] });
    queryClient.invalidateQueries({ queryKey: ['jobs', 'active'] });
    setApplyModalOpen(false);
    setSelectedJob(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
    if (score >= 50) return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20';
    return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20';
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Open Roles</h1>
        <p className="text-slate-500 dark:text-zinc-400 font-medium mt-1">Discover your next opportunity within the company.</p>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search roles by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-700 outline-none shadow-sm dark:shadow-none"
          />
        </div>

        <div className="relative shrink-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none h-12 pl-12 pr-10 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-slate-700 dark:text-zinc-300 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-700 outline-none shadow-sm dark:shadow-none cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none">
            <Filter className="w-4 h-4" />
          </div>
        </div>
      </div>

      {loading ? (
        <ViewOpeningsSkeleton count={3} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {currentJobs.length > 0 ? (
              currentJobs.map((job) => {
                const isExpired = job.application_deadline && new Date(job.application_deadline) < new Date(new Date().setHours(0, 0, 0, 0));
                const appliedApp = myApplications.find(a => a.job_id === job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-zinc-700 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                  >

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Briefcase className="w-6 h-6 text-slate-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-zinc-300 transition-colors">
                          {job.title}
                          {isExpired && <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">Expired</span>}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm font-medium text-slate-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location || 'Remote'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700"></span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.job_type || 'Full-time'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {job.salary_min ? `₹${(job.salary_min / 1000).toFixed(0)}k+` : 'Competitive'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Salary Range</p>
                      </div>
                      {appliedApp ? (
                        <button
                          disabled
                          className="h-10 px-6 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 text-sm font-bold rounded-xl whitespace-nowrap"
                        >
                          Applied
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents double firing when clicking button directly
                            setSelectedJob(job);
                          }}
                          className="h-10 px-6 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-xl shadow-md shadow-slate-200 dark:shadow-none transition-all active:scale-95 whitespace-nowrap"
                        >
                          View Details
                        </button>
                      )}
                    </div>


                  </div>
                )
              })
            ) : (
              <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none">
                <Briefcase className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">No open roles found</h3>
                <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1">Check back later or try adjusting your filters.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="text-sm font-bold text-slate-600 dark:text-zinc-400">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* APPLICATION DETAILS MODAL */}
      {selectedJob && !applyModalOpen && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={openApplyModal}
          appliedApplication={myApplications.find(a => a.job_id === selectedJob.id)}
        />
      )}

      {/* APPLY MODAL (Pre-Screening) */}
      {applyModalOpen && selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          onClose={closeApplyModal}
          onSuccess={handleApplicationSuccess}
        />
      )}

    </DashboardLayout>
  );
}

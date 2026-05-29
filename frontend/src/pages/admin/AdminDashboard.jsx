import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useAdminDashboard } from '../../hooks/useDashboard';
import { Users, Briefcase, FileText, ArrowUpRight, Plus, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardStatsSkeleton from '../../components/skeletons/DashboardStatsSkeleton';
import AdminRecentActivitySkeleton from '../../components/skeletons/AdminRecentActivitySkeleton';

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats = {
    activeJobsCount: 0,
    totalCandidatesCount: 0,
    totalApplicationsCount: 0,
    recentJobs: []
  }, isLoading: loading } = useAdminDashboard();

  const statCards = [
    { label: "Active Jobs", value: stats.activeJobsCount, icon: Briefcase, glow: "bg-blue-500/10" },
    { label: "Total Candidates", value: stats.totalCandidatesCount, icon: Users, glow: "bg-emerald-500/10" },
    { label: "Applications", value: stats.totalApplicationsCount, icon: FileText, glow: "bg-purple-500/10" },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-3 py-1 text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-4 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Admin Portal
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2 text-lg">Here is what's happening today, {user?.full_name?.split(' ')[0]}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/users"
            className="inline-flex items-center justify-center h-12 px-6 font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl shadow-sm transition-all active:scale-95 gap-2"
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">New User</span>
          </Link>
          <Link 
            to="/admin/jobs"
            className="inline-flex items-center justify-center h-12 px-6 font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white rounded-xl shadow-xl shadow-zinc-900/10 dark:shadow-none transition-all active:scale-95 gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Post Job</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          <DashboardStatsSkeleton count={3} />
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm dark:shadow-none">
            <div className="w-48 h-7 bg-zinc-200 dark:bg-zinc-800 rounded mb-6 animate-pulse"></div>
            <AdminRecentActivitySkeleton count={3} />
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, i) => (
              <div key={i} className="relative overflow-hidden bg-white dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm dark:shadow-none group hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-200/50 transition-all duration-500">
                {/* Subtle ambient glow */}
                <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${stat.glow} dark:bg-white/5 blur-3xl group-hover:scale-150 transition-transform duration-700`} />
                
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-4xl font-black text-zinc-900 dark:text-zinc-100 mt-2 tracking-tight">{stat.value}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 ring-1 ring-inset ring-zinc-900/5 dark:ring-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Recent Job Postings</h3>
              <Link to="/admin/jobs" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                View all <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.recentJobs.length > 0 ? (
                stats.recentJobs.map((job) => (
                  <Link to={`/admin/jobs`} key={job.id} className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 rounded-2xl shadow-sm dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-600 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-700/50 shadow-sm group-hover:scale-110 transition-transform">
                        <Briefcase className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">{job.title}</h4>
                        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1">
                          {job.location || 'Remote'} <span className="mx-2 text-zinc-300 dark:text-zinc-700">•</span> {job.job_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest ${
                        job.status === 'active' 
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400'
                      }`}>
                        {job.status}
                      </span>
                      <ArrowUpRight className="w-5 h-5 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-1 transition-all hidden sm:block" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl">
                  <Briefcase className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">No active job postings found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

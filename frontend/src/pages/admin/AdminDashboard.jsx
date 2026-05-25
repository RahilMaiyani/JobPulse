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
    { label: "Active Jobs", value: stats.activeJobsCount, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Candidates", value: stats.totalCandidatesCount, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Applications", value: stats.totalApplicationsCount, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-slate-500 dark:text-zinc-400 font-medium mt-1">Here is what's happening today, {user?.full_name?.split(' ')[0]}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/users"
            className="inline-flex items-center justify-center h-10 px-4 font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl shadow-sm transition-all active:scale-95 gap-2"
          >
            <UserPlus className="w-4 h-4" />
            New User
          </Link>
          <Link 
            to="/admin/jobs"
            className="inline-flex items-center justify-center h-10 px-4 font-bold text-white bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-white rounded-xl shadow-lg shadow-slate-300 dark:shadow-none transition-all active:scale-95 gap-2"
          >
            <Plus className="w-4 h-4" />
            Post Job
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          <DashboardStatsSkeleton count={3} />
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="w-48 h-7 bg-slate-200 dark:bg-zinc-800 rounded mb-6 animate-pulse"></div>
            <AdminRecentActivitySkeleton count={3} />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-none flex items-center justify-between group hover:shadow-md dark:hover:border-zinc-700 transition-all">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-zinc-100 mt-2">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} dark:bg-zinc-800 dark:text-zinc-300 transition-transform group-hover:scale-110`}>
                  <stat.icon className="w-7 h-7" />
                </div>
              </div>
            ))}
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight">Recent Job Postings</h3>
              <Link to="/admin/jobs" className="text-sm font-bold text-slate-900 dark:text-zinc-300 flex items-center gap-1 hover:text-slate-700 dark:hover:text-zinc-100">
                View all <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.recentJobs.length > 0 ? (
                stats.recentJobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800/50 bg-slate-50 dark:bg-zinc-800/30 flex items-center justify-between hover:border-slate-200 dark:hover:border-zinc-700 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-zinc-100">{job.title}</h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1">{job.location || 'Remote'} • {job.job_type}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-widest ${
                      job.status === 'active' 
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                  <p className="text-slate-500 dark:text-zinc-500 font-medium">No active job postings found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

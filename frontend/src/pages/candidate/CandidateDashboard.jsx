import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useCandidateDashboard } from '../../hooks/useDashboard';
import { Briefcase, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardStatsSkeleton from '../../components/skeletons/DashboardStatsSkeleton';
import JobCardSkeleton from '../../components/skeletons/JobCardSkeleton';

export default function CandidateDashboard() {
  const { user } = useAuth();

  const { data: stats = { openRolesCount: 0, myApplicationsCount: 0, recentOpenings: [] }, isLoading: loading } = useCandidateDashboard();

  const statCards = [
    { label: "Open Roles", value: stats.openRolesCount, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "My Applications", value: stats.myApplicationsCount, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Candidate Portal</h1>
        <p className="text-slate-500 dark:text-zinc-400 font-medium mt-1">Welcome back, {user?.full_name}. Find your next role here.</p>
      </div>

      {loading ? (
        <div className="space-y-8">
          <DashboardStatsSkeleton count={3} />
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="w-48 h-7 bg-slate-200 dark:bg-zinc-800 rounded mb-6 animate-pulse"></div>
            <JobCardSkeleton count={3} />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <Link to="/candidate/openings" className="bg-slate-900 dark:bg-zinc-800 p-6 rounded-2xl border border-slate-800 dark:border-zinc-700 shadow-lg shadow-slate-300 dark:shadow-none flex flex-col justify-center items-center text-center group hover:bg-slate-800 dark:hover:bg-zinc-700 transition-all active:scale-95 cursor-pointer">
              <p className="text-sm font-bold text-slate-300 dark:text-zinc-400 mb-2">Ready to apply?</p>
              <div className="text-white dark:text-zinc-100 font-bold flex items-center gap-2 group-hover:underline">
                View all openings <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* RECENT OPENINGS */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight">Newest Openings</h3>
              <Link to="/candidate/openings" className="text-sm font-bold text-slate-900 dark:text-zinc-300 flex items-center gap-1 hover:text-slate-700 dark:hover:text-zinc-100">
                Browse all
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentOpenings.length > 0 ? (
                stats.recentOpenings.map((job) => (
                  <div key={job.id} className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800/50 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/30 shadow-sm dark:shadow-none hover:shadow-md transition-all group">
                    <Link to="/candidate/openings">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                        <Briefcase className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-lg group-hover:text-blue-600 dark:group-hover:text-zinc-300 transition-colors">{job.title}</h4>
                      <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 mt-1 uppercase tracking-widest">{job.location || 'Remote'} • {job.job_type}</p>
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/50 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-600 dark:text-zinc-400">{job.salary_min ? `₹${(job.salary_min / 1000).toFixed(0)}k+` : 'Competitive'}</span>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No open roles currently available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

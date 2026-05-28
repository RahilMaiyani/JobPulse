import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useCandidateDashboard } from '../../hooks/useDashboard';
import { useNotifications, useMarkNotificationAsRead } from '../../hooks/useNotifications';
import { Briefcase, FileText, ArrowRight, Bell, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardStatsSkeleton from '../../components/skeletons/DashboardStatsSkeleton';
import JobCardSkeleton from '../../components/skeletons/JobCardSkeleton';

export default function CandidateDashboard() {
  const { user } = useAuth();

  const { data: stats = { openRolesCount: 0, myApplicationsCount: 0, recentOpenings: [] }, isLoading: loading } = useCandidateDashboard();

  const { data: notifications = [] } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const unreadNotifications = notifications.filter(n => !n.is_read);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          accent: 'bg-emerald-500',
          iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
          iconColor: 'text-emerald-500',
        };
      case 'error':
        return {
          accent: 'bg-rose-500',
          iconBg: 'bg-rose-50 dark:bg-rose-500/10',
          iconColor: 'text-rose-500',
        };
      case 'warning':
        return {
          accent: 'bg-amber-500',
          iconBg: 'bg-amber-50 dark:bg-amber-500/10',
          iconColor: 'text-amber-500',
        };
      case 'info':
      default:
        return {
          accent: 'bg-indigo-500',
          iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
          iconColor: 'text-indigo-500',
        };
    }
  };

  const statCards = [
    { label: "Open Roles", value: stats.openRolesCount, icon: Briefcase, glow: "bg-blue-500/10" },
    { label: "My Applications", value: stats.myApplicationsCount, icon: FileText, glow: "bg-emerald-500/10" },
  ];

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-10 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-3 py-1 text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-4 shadow-sm">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          Candidate Portal
        </div>
        <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
          Welcome back, {user?.full_name?.split(' ')[0]}.
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">
          Your personalized dashboard for discovering open roles and tracking applications.
        </p>
      </div>

      {unreadNotifications.length > 0 && (
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Recent Notifications</h2>
            <span className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-xs font-bold px-3 py-1 rounded-full">{unreadNotifications.length} New</span>
          </div>
          {unreadNotifications.map(notification => {
            const styles = getTypeStyles(notification.type);
            return (
              <div key={notification.id} className="relative bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-5 shadow-sm hover:shadow-md dark:shadow-none flex items-start justify-between group transition-all">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${styles.iconBg} ring-1 ring-inset ring-zinc-900/5 dark:ring-white/5`}>
                    <Bell className={`w-5 h-5 ${styles.iconColor}`} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                      {notification.title}
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.accent}`}></span>
                    </h4>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{notification.message}</p>
                  </div>
                </div>
                <button 
                  onClick={() => markAsReadMutation.mutate(notification.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0 ml-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="space-y-8">
          <DashboardStatsSkeleton count={3} />
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm dark:shadow-none">
            <div className="w-48 h-7 bg-zinc-200 dark:bg-zinc-800 rounded mb-6 animate-pulse"></div>
            <JobCardSkeleton count={3} />
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

            <Link to="/candidate/openings" className="relative overflow-hidden bg-zinc-900 dark:bg-zinc-100 p-6 rounded-3xl shadow-xl shadow-zinc-900/10 dark:shadow-none flex flex-col justify-center items-center text-center group transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer isolate">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-black/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500 mb-2 tracking-wide">Ready to apply?</p>
              <div className="text-white dark:text-zinc-900 font-black text-xl tracking-tight flex items-center gap-2 group-hover:gap-3 transition-all">
                View all openings <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          {/* RECENT OPENINGS */}
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Newest Openings</h3>
              <Link to="/candidate/openings" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Browse all
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stats.recentOpenings.length > 0 ? (
                stats.recentOpenings.map((job) => (
                  <Link to="/candidate/openings" key={job.id} className="block p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 shadow-sm dark:shadow-none hover:shadow-xl hover:shadow-zinc-200/40 hover:-tranzinc-y-1 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <Briefcase className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                    </div>
                    <h4 className="font-black text-zinc-900 dark:text-zinc-100 text-xl tracking-tight mb-2 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">{job.title}</h4>
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-6">
                      {job.location || 'Remote'} <span className="mx-2 text-zinc-300 dark:text-zinc-700">•</span> {job.job_type}
                    </p>
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                      <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {job.salary_min ? `₹${(job.salary_min / 1000).toFixed(0)}k+` : 'Competitive'}
                      </span>
                      <ArrowRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:tranzinc-x-1 transition-all" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12 border-2 border-dashed border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl">
                  <Briefcase className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">No open roles currently available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/SEO';
import { useCandidateDashboard } from '../../hooks/useDashboard';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../hooks/useNotifications';
import { Briefcase, FileText, ArrowRight, Bell, X, Calendar, Video, Clock, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardStatsSkeleton from '../../components/skeletons/DashboardStatsSkeleton';
import JobCardSkeleton from '../../components/skeletons/JobCardSkeleton';

export default function CandidateDashboard() {
  const { user } = useAuth();

  const { data: stats = { openRolesCount: 0, myApplicationsCount: 0, recentOpenings: [], recentApplication: null, pendingTest: null, upcomingInterview: null }, isLoading: loading } = useCandidateDashboard();

  const { data: notifications = [] } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
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
      <SEO title="Dashboard" />
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

      {/* Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Recent Notifications</h2>
              <span className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-xs font-bold px-3 py-1 rounded-full">{unreadNotifications.length} New</span>
            </div>
            {unreadNotifications.length > 1 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                className="text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Mark all as read
              </button>
            )}
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

          {/* PENDING TEST ALERT */}
          {stats.pendingTest && (
            <div className="relative overflow-hidden bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in slide-in-from-top-4 duration-500">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-rose-500/20 dark:bg-rose-500/10 blur-2xl rounded-full pointer-events-none"></div>
              <div className="flex items-start sm:items-center gap-4 relative z-10 w-full">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-rose-500/20 flex items-center justify-center shrink-0 shadow-sm border border-rose-100 dark:border-rose-500/30">
                  <Zap className="w-5 h-5 text-rose-600 dark:text-rose-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="inline-flex items-center rounded bg-rose-100 dark:bg-rose-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                      Action Required
                    </span>
                    <h2 className="text-base font-bold text-rose-950 dark:text-rose-100 tracking-tight">Pending Aptitude Test</h2>
                  </div>
                  <p className="text-rose-700/80 dark:text-rose-300/80 text-sm">
                    You have a mandatory quiz for <span className="font-bold text-rose-900 dark:text-rose-200">{stats.pendingTest.job_title}</span>.
                    Closes at <span className="font-bold">{new Date(stats.pendingTest.scheduled_end_time).toLocaleString()}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* UPCOMING INTERVIEW */}
          {stats.upcomingInterview && (
            <div className="relative overflow-hidden bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4 relative z-10 w-full">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-indigo-500/20 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-500/30">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-indigo-950 dark:text-indigo-100 tracking-tight">Upcoming Interview</h2>
                  <p className="text-indigo-700/80 dark:text-indigo-300/80 text-sm mt-0.5">
                    Your interview for <span className="font-bold">{stats.upcomingInterview.job_title}</span> is on <span className="font-bold">{new Date(stats.upcomingInterview.scheduled_date).toLocaleDateString()}</span> at <span className="font-bold">{stats.upcomingInterview.scheduled_time}</span>.
                  </p>
                </div>
              </div>
              {stats.upcomingInterview.meeting_link && (
                <a
                  href={stats.upcomingInterview.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto shrink-0 relative z-10 inline-flex items-center justify-center h-9 px-4 font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg transition-all shadow-sm active:scale-95 gap-1.5 text-sm"
                >
                  <Video className="w-4 h-4" /> Join Call
                </a>
              )}
            </div>
          )}

          {/* PIPELINE TRACKER */}
          {stats.recentApplication && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Recent Application Tracker</h3>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                    Tracking your progress for <span className="font-bold text-zinc-700 dark:text-zinc-300">{stats.recentApplication.job_title}</span>
                  </p>
                </div>
                <Link to="/candidate/applications" className="shrink-0 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl transition-colors">
                  View All Applications
                </Link>
              </div>

              <div className="relative">
                {(() => {
                  const stages = [
                    { id: 'applied', label: 'Applied', icon: FileText },
                    { id: 'shortlisted', label: 'Shortlisted', icon: CheckCircle2 },
                    { id: 'interview', label: 'Interview', icon: Calendar },
                    { id: 'selected', label: 'Selected', icon: Briefcase }
                  ];

                  const currentStatus = stats.recentApplication.status.toLowerCase();

                  if (currentStatus === 'rejected') {
                    return (
                      <div className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl">
                        <X className="w-6 h-6 text-rose-500" />
                        <p className="font-bold text-rose-700 dark:text-rose-400">Application Closed. Check out other openings!</p>
                      </div>
                    );
                  }

                  if (currentStatus === 'selected' || currentStatus === 'hired') {
                    return (
                      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none"></div>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-400/20 blur-3xl rounded-full pointer-events-none"></div>
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xl shadow-emerald-500/30 relative z-10 rotate-3">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div className="relative z-10 text-center sm:text-left">
                          <span className="inline-block px-2.5 py-1 bg-emerald-200/50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-md mb-2">Offer Extended</span>
                          <h4 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">Congratulations! You're Hired!</h4>
                          <p className="text-emerald-800/80 dark:text-emerald-200/80 font-medium mt-1">
                            You've been selected for <span className="font-bold text-emerald-900 dark:text-white">{stats.recentApplication.job_title}</span>. Our team will contact you shortly with next steps.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const currentIndex = stages.findIndex(s => s.id === currentStatus) !== -1
                    ? stages.findIndex(s => s.id === currentStatus)
                    : (currentStatus === 'hired' ? 3 : 0);

                  return (
                    <div className="w-full overflow-x-auto pb-12 pt-4 custom-scrollbar">
                      <div className="flex items-center justify-between min-w-[320px] sm:min-w-[500px] px-4 sm:px-10">
                        {stages.map((stage, idx) => {
                          const isCompleted = idx <= currentIndex;
                          const isLineCompleted = idx < currentIndex;
                          const isActive = idx === currentIndex;
                          const isLast = idx === stages.length - 1;
                          const Icon = stage.icon;

                          return (
                            <React.Fragment key={stage.id}>
                              {/* Step Node */}
                              <div className="relative flex flex-col items-center justify-center shrink-0 z-10 group">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-500/20 scale-110' :
                                    isCompleted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' :
                                      'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 shadow-sm'
                                  }`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                {/* Absolute label prevents it from interfering with track line width math */}
                                <div className="absolute top-[3.75rem] left-1/2 -translate-x-1/2 w-20 sm:w-32 text-center pointer-events-none">
                                  <span className={`text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-colors block leading-tight ${isActive ? 'text-emerald-600 dark:text-emerald-400' :
                                      isCompleted ? 'text-zinc-800 dark:text-zinc-200' :
                                        'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400'
                                    }`}>
                                    {stage.label}
                                  </span>
                                </div>
                              </div>

                              {/* Connecting Line */}
                              {!isLast && (
                                <div className="flex-1 h-[4px] bg-zinc-200 dark:bg-zinc-800 -mx-1 relative overflow-hidden z-0 rounded-full">
                                  <div
                                    className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-700 ease-out"
                                    style={{ width: isLineCompleted ? '100%' : '0%' }}
                                  />
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

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
                  <Link to="/candidate/openings" key={job.id} className="block p-5 sm:p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 shadow-sm dark:shadow-none hover:shadow-xl hover:shadow-zinc-200/40 hover:-translate-y-1 transition-all duration-300 group">
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
                      <ArrowRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-1 transition-all" />
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

import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useAdminDashboard } from '../../hooks/useDashboard';
import SEO from '../../components/SEO';
import { Users, Briefcase, FileText, ArrowUpRight, Plus, UserPlus, Calendar, Activity, CheckCircle2, FileQuestion, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardStatsSkeleton from '../../components/skeletons/DashboardStatsSkeleton';
import AdminRecentActivitySkeleton from '../../components/skeletons/AdminRecentActivitySkeleton';

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats = {
    activeJobsCount: 0,
    totalCandidatesCount: 0,
    totalApplicationsCount: 0,
    recentJobs: [],
    funnelStats: {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      hired: 0,
      rejected: 0
    },
    recentActivities: []
  }, isLoading: loading } = useAdminDashboard();

  const statCards = [
    {
      label: "Active Jobs",
      value: stats.activeJobsCount,
      icon: Briefcase,
      glow: "bg-blue-500/10",
      trend: "+2 this week",
      trendColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
    },
    {
      label: "Total Candidates",
      value: stats.totalCandidatesCount,
      icon: Users,
      glow: "bg-emerald-500/10",
      trend: "+5 active today",
      trendColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
    },
    {
      label: "Total Applications",
      value: stats.totalApplicationsCount,
      icon: FileText,
      glow: "bg-purple-500/10",
      trend: "+14 submissions",
      trendColor: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10"
    },
  ];

  const funnelStages = [
    {
      label: "Applied",
      count: stats.funnelStats?.applied || 0,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
      description: "Awaiting screening"
    },
    {
      label: "Shortlisted",
      count: stats.funnelStats?.shortlisted || 0,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
      description: "Aptitude round"
    },
    {
      label: "Interviews",
      count: stats.funnelStats?.interview || 0,
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20",
      description: "Scheduled rounds"
    },
    {
      label: "Hired",
      count: (stats.funnelStats?.hired || 0) + (stats.funnelStats?.selected || 0),
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
      description: "Hired candidates"
    }
  ];

  const formatActivityTime = (timestamp) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <SEO title="Admin Dashboard" />
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-3 py-1 text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-4 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Control Center
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2 text-sm">Here is what's happening today, {user?.full_name?.split(' ')[0]}.</p>
        </div>

        {/* Sleek, consolidated header quick actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="inline-flex items-center justify-center h-12 px-6 font-black text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl shadow-sm transition-all active:scale-95 gap-2"
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">Manage Users</span>
          </Link>
          <Link
            to="/admin/jobs"
            className="inline-flex items-center justify-center h-12 px-6 font-black text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white rounded-2xl shadow-xl shadow-zinc-200 dark:shadow-none transition-all active:scale-95 hover:-translate-y-0.5 gap-2 duration-300 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Post Job</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          <DashboardStatsSkeleton count={3} />
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm dark:shadow-none animate-pulse">
            <div className="w-48 h-7 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
            <AdminRecentActivitySkeleton count={3} />
          </div>
        </div>
      ) : (
        <div className="space-y-8">

          {/* STATS KPI CARDS - Compact & clean */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {statCards.map((stat, i) => (
              <div key={i} className="relative overflow-hidden bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 shadow-sm dark:shadow-none group hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-350">
                <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full ${stat.glow} dark:bg-white/5 blur-2xl group-hover:scale-150 transition-transform duration-700`} />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">{stat.value}</p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded ${stat.trendColor}`}>
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-850 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DYNAMIC PIPELINE PROGRESS RIBBON - Horizontal layout saves large space */}
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/60 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {funnelStages.map((stage, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-4 w-full lg:w-auto flex-1">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center shrink-0 text-xs font-black text-zinc-400 dark:text-zinc-600">
                      0{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">{stage.label}</p>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 leading-none">{stage.count}</span>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 truncate uppercase tracking-wider">candidates</span>
                      </div>
                    </div>
                  </div>
                  {i < funnelStages.length - 1 && (
                    <div className="hidden lg:block text-zinc-300 dark:text-zinc-700 font-light px-1 select-none">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* CORE SPLIT GRID - Clean balance without quick action kit clutter */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* COLUMN 1: RECENT POSTINGS (60%) */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/60 rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Active Postings</h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">Quick status update on your active job listings.</p>
                  </div>
                  <Link to="/admin/jobs" className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 uppercase tracking-widest flex items-center gap-1 transition-colors">
                    All Jobs <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {stats.recentJobs.length > 0 ? (
                    stats.recentJobs.map((job) => (
                      <Link to={`/admin/jobs`} key={job.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover:scale-105 transition-transform">
                            <Briefcase className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{job.title}</h4>
                            <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                              {job.location || 'Remote'} <span className="mx-1.5 text-zinc-300 dark:text-zinc-700">&bull;</span> {job.job_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border ${job.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                            }`}>
                            {job.status}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <Briefcase className="w-8 h-8 text-zinc-300 dark:text-zinc-650 mx-auto mb-3" />
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold">No active job postings found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2: LIVE ACTIVITY FEED (40%) */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/60 rounded-[2rem] p-6 sm:p-8 shadow-sm h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500 animate-pulse" /> Live Feed
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">Real-time candidate actions across the platform.</p>
                </div>

                <div className="flex-1 space-y-4">
                  {stats.recentActivities && stats.recentActivities.length > 0 ? (
                    stats.recentActivities.map((act, i) => (
                      <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl flex items-start gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${act.activity_type === 'applied'
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20'
                          : act.activity_type === 'quiz_completed'
                            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20'
                            : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20'
                          }`}>
                          {act.activity_type === 'applied' && <FileText className="w-4 h-4" />}
                          {act.activity_type === 'quiz_completed' && <FileQuestion className="w-4 h-4" />}
                          {act.activity_type === 'interview_scheduled' && <Calendar className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug break-words">
                            {act.activity_type === 'applied' && (
                              <span>
                                <span className="font-black text-indigo-600 dark:text-indigo-400">{act.full_name}</span> applied for <span className="font-black">{act.job_title}</span>
                              </span>
                            )}
                            {act.activity_type === 'quiz_completed' && (
                              <span>
                                <span className="font-black text-indigo-600 dark:text-indigo-400">{act.full_name}</span> completed test for <span className="font-black">{act.job_title}</span>
                              </span>
                            )}
                            {act.activity_type === 'interview_scheduled' && (
                              <span>
                                Interview scheduled with <span className="font-black text-indigo-600 dark:text-indigo-400">{act.full_name}</span> for <span className="font-black">{act.job_title}</span>
                              </span>
                            )}
                          </p>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                              {formatActivityTime(act.timestamp)}
                            </span>

                            {act.activity_type === 'applied' && (
                              <span className="inline-flex items-center text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">
                                Match: {act.ai_match_score}%
                              </span>
                            )}
                            {act.activity_type === 'quiz_completed' && (
                              <span className="inline-flex items-center text-[8px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-500/20">
                                Score: {act.score}%
                              </span>
                            )}
                            {act.activity_type === 'interview_scheduled' && (
                              <span className="inline-flex items-center text-[8px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-500/20">
                                {new Date(act.scheduled_date).toLocaleDateString()} at {act.scheduled_time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl h-full flex flex-col items-center justify-center bg-zinc-50/20 dark:bg-zinc-900/10">
                      <Activity className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-3" />
                      <p className="text-zinc-550 dark:text-zinc-500 text-xs font-semibold">No recent activity detected.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useAdminDashboard } from '../../hooks/useDashboard';
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

  // Pipeline stages logic (mapping db counts to HR funnel stages)
  const funnelStages = [
    { 
      label: "Applied", 
      count: stats.funnelStats?.applied || 0, 
      color: "from-blue-500 to-indigo-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
      description: "Awaiting screening" 
    },
    { 
      label: "Shortlisted", 
      count: stats.funnelStats?.shortlisted || 0, 
      color: "from-amber-500 to-orange-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
      description: "Aptitude round" 
    },
    { 
      label: "Interviews", 
      count: stats.funnelStats?.interview || 0, 
      color: "from-purple-500 to-pink-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20",
      description: "Scheduled rounds" 
    },
    { 
      label: "Hired / Selected", 
      count: (stats.funnelStats?.hired || 0) + (stats.funnelStats?.selected || 0), 
      color: "from-emerald-500 to-teal-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
      description: "Successfully hired" 
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
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-3 py-1 text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-4 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
            Control Center
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2 text-lg">Here is what's happening today, {user?.full_name?.split(' ')[0]}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/users"
            className="inline-flex items-center justify-center h-12 px-6 font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl shadow-sm transition-all active:scale-95 gap-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>New User</span>
          </Link>
          <Link 
            to="/admin/jobs"
            className="inline-flex items-center justify-center h-12 px-6 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Post Job</span>
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
        <div className="space-y-10">
          
          {/* STATS KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat, i) => (
              <div key={i} className="relative overflow-hidden bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm dark:shadow-none group hover:border-zinc-300 dark:hover:hover:border-zinc-700 hover:shadow-lg transition-all duration-300">
                <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${stat.glow} dark:bg-white/5 blur-3xl group-hover:scale-150 transition-transform duration-700`} />
                
                <div className="relative z-10 flex items-start justify-between">
                  <div className="space-y-4">
                    <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                    <div>
                      <p className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{stat.value}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 mt-2 rounded-lg text-[10px] font-black uppercase tracking-wider ${stat.trendColor}`}>
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 ring-1 ring-inset ring-zinc-900/5 dark:ring-white/5 group-hover:scale-115 transition-transform duration-300 shadow-sm">
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DYNAMIC PIPELINE FUNNEL */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Active Hiring Pipeline
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-1">Real-time breakdown of candidates progressing through the selection stages.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {funnelStages.map((stage, i) => (
                <div key={i} className="relative overflow-hidden p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/30 flex flex-col justify-between min-h-[140px] group transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{stage.label}</p>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-0.5">{stage.description}</p>
                    </div>
                    {/* Stage Index badge */}
                    <span className="text-xs font-black text-zinc-300 dark:text-zinc-700">0{i+1}</span>
                  </div>
                  
                  <div className="flex items-end justify-between mt-4">
                    <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{stage.count}</span>
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${stage.color}`}>
                      Stage 0{i+1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* INTERACTIVE ACTIONS HUB & RECENT JOBS */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* INTERACTIVE QUICK ACTIONS HUB */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Administrative Toolkit</h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-1">Frequently used recruitment workflows at your fingertips.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link 
                    to="/admin/jobs" 
                    className="p-5 bg-gradient-to-br from-indigo-50/50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-900/50 hover:from-indigo-100/50 dark:hover:from-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700 rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">Post New Role</h4>
                      <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1">Create a new vacancy listing</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:translate-x-1 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                  </Link>

                  <Link 
                    to="/admin/jobs" 
                    className="p-5 bg-gradient-to-br from-amber-50/50 to-amber-50 dark:from-zinc-900 dark:to-zinc-900/50 hover:from-amber-100/50 dark:hover:from-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-zinc-700 rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">Create Aptitude Quiz</h4>
                      <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1">Generate an assessment test</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:translate-x-1 transition-transform">
                      <FileQuestion className="w-4 h-4" />
                    </div>
                  </Link>

                  <Link 
                    to="/admin/users" 
                    className="p-5 bg-gradient-to-br from-emerald-50/50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-900/50 hover:from-emerald-100/50 dark:hover:from-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-zinc-700 rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">Manage Board Users</h4>
                      <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1">Toggle status or delete accounts</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:translate-x-1 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                  </Link>

                  <Link 
                    to="/admin/jobs" 
                    className="p-5 bg-gradient-to-br from-purple-50/50 to-purple-50 dark:from-zinc-900 dark:to-zinc-900/50 hover:from-purple-100/50 dark:hover:from-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-zinc-700 rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">Review Applications</h4>
                      <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1">View applicant submissions</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:translate-x-1 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              </div>

              {/* RECENT JOBS */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Recent Job Postings</h3>
                  <Link to="/admin/jobs" className="text-xs font-black text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 uppercase tracking-widest flex items-center gap-1 transition-colors">
                    All Jobs <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {stats.recentJobs.length > 0 ? (
                    stats.recentJobs.map((job) => (
                      <Link to={`/admin/jobs`} key={job.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover:scale-105 transition-transform">
                            <Briefcase className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">{job.title}</h4>
                            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                              {job.location || 'Remote'} <span className="mx-1.5 text-zinc-300 dark:text-zinc-700">•</span> {job.job_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border ${
                            job.status === 'active' 
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' 
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                          }`}>
                            {job.status}
                          </span>
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

            {/* LIVE ACTIVITY FEED COLUMN */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] p-6 sm:p-8 shadow-sm h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" /> Live Activity Feed
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-1">Real-time overview of ongoing candidate activities and applications.</p>
                </div>

                <div className="flex-1 space-y-4">
                  {stats.recentActivities && stats.recentActivities.length > 0 ? (
                    stats.recentActivities.map((act, i) => (
                      <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          act.activity_type === 'applied' 
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20' 
                            : act.activity_type === 'quiz_completed' 
                            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20' 
                            : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20'
                        }`}>
                          {act.activity_type === 'applied' && <FileText className="w-4 h-4" />}
                          {act.activity_type === 'quiz_completed' && <FileQuestion className="w-4 h-4" />}
                          {act.activity_type === 'interview_scheduled' && <Calendar className="w-4 h-4" />}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
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
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                              {formatActivityTime(act.timestamp)}
                            </span>
                            
                            {act.activity_type === 'applied' && (
                              <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                                Match: {act.ai_match_score}%
                              </span>
                            )}
                            {act.activity_type === 'quiz_completed' && (
                              <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-100 dark:border-amber-500/20">
                                Score: {act.score}%
                              </span>
                            )}
                            {act.activity_type === 'interview_scheduled' && (
                              <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-100 dark:border-purple-500/20">
                                {new Date(act.scheduled_date).toLocaleDateString()} at {act.scheduled_time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl h-full flex flex-col items-center justify-center">
                      <Activity className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-3" />
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold">No recent activity detected.</p>
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

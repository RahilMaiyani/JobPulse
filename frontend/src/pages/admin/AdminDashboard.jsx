import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Users, Briefcase, FileText, ArrowUpRight, Plus, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeJobsCount: 0,
    totalCandidatesCount: 0,
    totalApplicationsCount: 0,
    recentJobs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Active Jobs", value: stats.activeJobsCount, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Candidates", value: stats.totalCandidatesCount, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Applications", value: stats.totalApplicationsCount, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Here is what's happening today, {user?.full_name?.split(' ')[0]}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/users"
            className="inline-flex items-center justify-center h-10 px-4 font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl shadow-sm transition-all active:scale-95 gap-2"
          >
            <UserPlus className="w-4 h-4" />
            New User
          </Link>
          <Link 
            to="/admin/jobs"
            className="inline-flex items-center justify-center h-10 px-4 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-300 transition-all active:scale-95 gap-2"
          >
            <Plus className="w-4 h-4" />
            Post Job
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-3">
                  <div className="w-24 h-4 bg-slate-200 rounded"></div>
                  <div className="w-16 h-8 bg-slate-200 rounded"></div>
                </div>
                <div className="w-14 h-14 rounded-xl bg-slate-200"></div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="w-48 h-7 bg-slate-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="w-32 h-6 bg-slate-200 rounded"></div>
                    <div className="w-24 h-3 bg-slate-200 rounded"></div>
                  </div>
                  <div className="w-20 h-6 bg-slate-200 rounded-md"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon className="w-7 h-7" />
                </div>
              </div>
            ))}
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Job Postings</h3>
              <Link to="/admin/jobs" className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
                View all <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.recentJobs.length > 0 ? (
                stats.recentJobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between hover:border-slate-200 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-900">{job.title}</h4>
                      <p className="text-xs font-medium text-slate-500 mt-1">{job.location || 'Remote'} • {job.job_type}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 uppercase tracking-widest">
                      {job.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-500 font-medium">No active job postings found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

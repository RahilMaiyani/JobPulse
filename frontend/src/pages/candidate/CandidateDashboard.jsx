import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    openRolesCount: 0,
    myApplicationsCount: 0,
    recentOpenings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/candidate');
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Open Roles", value: stats.openRolesCount, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "My Applications", value: stats.myApplicationsCount, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Candidate Portal</h1>
        <p className="text-slate-500 font-medium mt-1">Welcome back, {user?.full_name}. Find your next role here.</p>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 mb-4"></div>
                  <div className="w-3/4 h-7 bg-slate-200 rounded mb-1"></div>
                  <div className="w-1/2 h-4 bg-slate-200 rounded mb-4"></div>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="w-24 h-5 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <Link to="/candidate/openings" className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg shadow-slate-300 flex flex-col justify-center items-center text-center group hover:bg-slate-800 transition-all active:scale-95 cursor-pointer">
              <p className="text-sm font-bold text-slate-300 mb-2">Ready to apply?</p>
              <div className="text-white font-bold flex items-center gap-2 group-hover:underline">
                View all openings <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* RECENT OPENINGS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Newest Openings</h3>
              <Link to="/candidate/openings" className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
                Browse all
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentOpenings.length > 0 ? (
                stats.recentOpenings.map((job) => (
                  <div key={job.id} className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-sm hover:shadow-md transition-all group">
                    <Link to="/candidate/openings">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                        <Briefcase className="w-5 h-5 text-slate-600" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{job.location || 'Remote'} • {job.job_type}</p>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-600">{job.salary_min ? `₹${(job.salary_min / 1000).toFixed(0)}k+` : 'Competitive'}</span>
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

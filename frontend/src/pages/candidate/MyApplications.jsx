import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { Briefcase, Calendar, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      setApplications(response.data.applications);
    } catch (err) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Applied': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200"><Clock className="w-3 h-3"/> Applied</span>;
      case 'Shortlisted': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200"><CheckCircle2 className="w-3 h-3"/> Shortlisted</span>;
      case 'Hired': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200"><CheckCircle2 className="w-3 h-3"/> Hired</span>;
      case 'Rejected': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-full border border-rose-200"><XCircle className="w-3 h-3"/> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 text-slate-700 font-bold text-xs rounded-full border border-slate-200">{status}</span>;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Applications</h1>
        <p className="text-slate-500 font-medium mt-1">Track the status of your recent job applications.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No applications yet</h3>
          <p className="text-slate-500 text-sm mt-1">Head over to Open Roles to find your next opportunity.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Role & Company</th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Applied On</th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">AI Score</th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                          <Briefcase className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{app.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium text-slate-500">{app.company_name}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-xs font-bold text-slate-400">{app.job_type}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(app.applied_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border font-black text-sm ${getScoreColor(app.ai_match_score)}`}>
                        {app.ai_match_score}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {getStatusBadge(app.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

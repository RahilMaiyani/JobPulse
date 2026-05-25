import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobFormModal({ job, onClose, onSuccess }) {
  const isEditMode = !!job;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [jobForm, setJobForm] = useState({
    title: '', description: '', location: '', job_type: 'Full-time', salary_min: '', salary_max: '', application_deadline: '', requirements: []
  });
  const [reqInput, setReqInput] = useState("");

  useEffect(() => {
    if (isEditMode && job) {
      setJobForm({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        job_type: job.job_type || 'Full-time',
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || '',
        application_deadline: job.application_deadline ? new Date(job.application_deadline).toISOString().split('T')[0] : '',
        requirements: job.requirements || []
      });
    }
  }, [job, isEditMode]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/jobs/${job.id}`, jobForm);
        toast.success("Job updated successfully!");
      } else {
        await api.post('/jobs', jobForm);
        toast.success("Job posted successfully!");
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50">
          <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">{isEditMode ? 'Edit Job' : 'Post New Job'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Job Title *</label>
            <input
              required
              type="text"
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-700 outline-none"
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Location</label>
              <input
                type="text"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-700 outline-none"
                placeholder="e.g. Remote, San Francisco"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Job Type</label>
              <select
                value={jobForm.job_type}
                onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-700 outline-none"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Salary Min</label>
              <input
                type="number"
                value={jobForm.salary_min}
                onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value })}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-700 outline-none"
                placeholder="e.g. 80000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Salary Max</label>
              <input
                type="number"
                value={jobForm.salary_max}
                onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value })}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-700 outline-none"
                placeholder="e.g. 120000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Application Deadline</label>
            <input
              type="date"
              value={jobForm.application_deadline}
              onChange={(e) => setJobForm({ ...jobForm, application_deadline: e.target.value })}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-700 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Requirements</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (reqInput.trim()) {
                      setJobForm({ ...jobForm, requirements: [...jobForm.requirements, reqInput.trim()] });
                      setReqInput('');
                    }
                  }
                }}
                className="flex-1 h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-700 outline-none"
                placeholder="e.g. 5+ years of React experience"
              />
              <button
                type="button"
                onClick={() => {
                  if (reqInput.trim()) {
                    setJobForm({ ...jobForm, requirements: [...jobForm.requirements, reqInput.trim()] });
                    setReqInput('');
                  }
                }}
                className="h-10 px-4 font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-slate-200 dark:border-zinc-800"
              >
                Add
              </button>
            </div>
            {jobForm.requirements && jobForm.requirements.length > 0 && (
              <ul className="mt-2 space-y-1">
                {jobForm.requirements.map((req, i) => (
                  <li key={i} className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-zinc-300">
                    <span>• {req}</span>
                    <button
                      type="button"
                      onClick={() => setJobForm({ ...jobForm, requirements: jobForm.requirements.filter((_, index) => index !== i) })}
                      className="text-slate-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Description *</label>
            <textarea
              required
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-700 outline-none min-h-[120px]"
              placeholder="Job requirements and responsibilities..."
            ></textarea>
          </div>

        </form>

        <div className="p-6 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-zinc-800/50 shrink-0">
          <button
            onClick={onClose}
            className="px-6 h-10 font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 bg-slate-100 dark:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFormSubmit}
            disabled={isSubmitting}
            className="px-6 h-10 font-bold text-white dark:text-zinc-900 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? <div className="w-4 h-4 border-2 border-slate-400 dark:border-zinc-500 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></div> : null}
            {isEditMode ? 'Save Changes' : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  );
}

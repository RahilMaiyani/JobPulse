import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useProfile, useResumes, useUpdateProfile, useUploadResume, useDeleteResume, useResetPassword } from '../../hooks/useProfile';
import { User, Phone, Briefcase, Lock, Save, X, Link, FileText, UploadCloud, Trash2, Download } from 'lucide-react';
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function CandidateProfile() {
  const { user: currentUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    phone: '',
    bio: '',
    experience_years: '',
    current_company: '',
    linkedin_profile: '',
    skills: []
  });
  const [skillInput, setSkillInput] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { data: profileData, isLoading: isLoadingProfile } = useProfile(currentUser.id);
  const { data: resumes = [], isLoading: isLoadingResumes } = useResumes();

  useEffect(() => {
    if (profileData) {
      setProfileForm({
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        experience_years: profileData.experience_years !== null ? profileData.experience_years.toString() : '',
        current_company: profileData.current_company || '',
        linkedin_profile: profileData.linkedin_profile || 'https://linkedin.com/in/',
        skills: profileData.skills || []
      });
    }
  }, [profileData]);

  const loading = isLoadingProfile || isLoadingResumes;

  const uploadResumeMutation = useUploadResume();
  const deleteResumeMutation = useDeleteResume();
  const updateProfileMutation = useUpdateProfile();

  const passwordMutation = useResetPassword();

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (resumes.length >= 3) return toast.error("You can only upload a maximum of 3 resumes.");
    if (file.type !== 'application/pdf') return toast.error("Only PDF files are allowed.");
    if (file.size > 500 * 1024) return toast.error("File is too large. Maximum size is 500KB.");

    const formData = new FormData();
    formData.append('resume', file);
    uploadResumeMutation.mutate(formData);
    e.target.value = '';
  };

  const handleDeleteResume = (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    deleteResumeMutation.mutate(id);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    passwordMutation.mutate({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    }, {
      onSuccess: () => {
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    });
  };

  const addSkill = () => {
    const newSkill = skillInput.trim();
    if (!newSkill) return;
    if (newSkill.length > 50) {
      return toast.error("Skill cannot exceed 50 characters.");
    }
    if (profileForm.skills.length >= 15) {
      return toast.error("You can add a maximum of 15 skills.");
    }
    if (!profileForm.skills.includes(newSkill)) {
      setProfileForm({ ...profileForm, skills: [...profileForm.skills, newSkill] });
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setProfileForm({ ...profileForm, skills: profileForm.skills.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">My Profile</h1>
        <p className="text-slate-500 dark:text-zinc-400 font-medium mt-1">Manage your personal information and account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Profile Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-800/50">
              <User className="w-5 h-5 text-slate-600 dark:text-zinc-300" />
              <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100">Personal Details</h2>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Phone Number (India only)</label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-sm font-bold">
                      +91
                    </span>
                    <input type="tel" maxLength="10" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })} className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-r-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-600 outline-none" placeholder="10-digit number" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Years of Experience (0 for None)</label>
                  <input type="number" min="0" max="50" value={profileForm.experience_years} onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })} className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-600 outline-none" placeholder="e.g. 3 or 0" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Current Company</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"><Briefcase className="w-4 h-4" /></div>
                    <input type="text" value={profileForm.current_company} onChange={(e) => setProfileForm({ ...profileForm, current_company: e.target.value })} className="w-full h-10 pl-10 pr-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-600 outline-none" placeholder="Acme Corp or 'None'" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">LinkedIn Profile</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"><Link className="w-4 h-4" /></div>
                    <input type="text" value={profileForm.linkedin_profile} onChange={(e) => setProfileForm({ ...profileForm, linkedin_profile: e.target.value })} className="w-full h-10 pl-10 pr-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-600 outline-none" placeholder="https://linkedin.com/in/johndoe" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Bio / About Me</label>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">{profileForm.bio.length} / 1000</span>
                </div>
                <textarea maxLength="1000" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-600 outline-none min-h-[100px]" placeholder="Tell us about yourself..."></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Skills</label>
                <div className="flex gap-2">
                  <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} className="flex-1 h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-600 outline-none" placeholder="e.g. React, Node.js" />
                  <button type="button" onClick={addSkill} className="h-10 px-4 font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-slate-200 dark:border-zinc-700">Add</button>
                </div>
                {profileForm.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profileForm.skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-lg border border-slate-200 dark:border-zinc-700">
                        {skill}
                        <button type="button" onClick={() => removeSkill(index)} className="hover:text-rose-500 dark:hover:text-rose-400"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={updateProfileMutation.isPending} className="h-10 px-6 font-bold text-white dark:text-zinc-900 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white rounded-xl shadow-md shadow-slate-300 dark:shadow-none transition-all active:scale-95 flex items-center gap-2 border border-transparent">
                  {updateProfileMutation.isPending ? <div className="w-4 h-4 border-2 border-slate-400 dark:border-zinc-400 border-t-slate-900 dark:border-t-zinc-900 rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security / Password Reset */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-800/50">
              <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100">Security</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Current Password</label>
                <input required type="password" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">New Password</label>
                <input required type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Confirm New Password</label>
                <input required type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full h-10 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={passwordMutation.isPending} className="w-full h-10 font-bold text-rose-700 dark:text-zinc-900 bg-rose-50 dark:bg-rose-400 border border-rose-100 dark:border-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2">
                  {passwordMutation.isPending ? <div className="w-4 h-4 border-2 border-rose-400 dark:border-zinc-400 border-t-rose-700 dark:border-t-zinc-900 rounded-full animate-spin"></div> : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Resume Vault */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600 dark:text-zinc-300" />
                <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100">Resume Vault</h2>
              </div>
              <label className={`cursor-pointer ${resumes.length >= 3 ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="file" className="hidden" accept="application/pdf" onChange={handleResumeUpload} disabled={uploadResumeMutation.isPending || resumes.length >= 3} />
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${uploadResumeMutation.isPending ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border-slate-200 dark:border-zinc-700' : 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-slate-900 dark:border-zinc-100 hover:bg-slate-800 dark:hover:bg-white'}`}>
                  {uploadResumeMutation.isPending ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5" />
                  )}
                  {resumes.length >= 3 ? 'Limit Reached' : 'Upload PDF'}
                </span>
              </label>
            </div>
            {resumes.length >= 3 && (
              <div className="px-6 py-2 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                You have reached the maximum limit of 3 resumes. Delete an old one to upload a new resume.
              </div>
            )}
            <div className="p-6 overflow-y-auto max-h-[300px] custom-scrollbar flex-1 bg-slate-50/50 dark:bg-zinc-900">
              {resumes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">No resumes uploaded.</p>
                  <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 mt-1">Upload a PDF up to 500KB.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-none group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-rose-500 dark:text-zinc-300" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate" title={r.file_name}>{r.file_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">{new Date(r.uploaded_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`http://localhost:5000${r.file_path}`} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleDeleteResume(r.id)} className="p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

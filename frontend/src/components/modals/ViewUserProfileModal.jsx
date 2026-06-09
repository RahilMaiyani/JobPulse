import useEscapeKey from '../../hooks/useEscapeKey';
import React from 'react';
import { CheckCircle2, Ban, X, Mail, Phone, Calendar, Briefcase, FileText } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUsers';
import { useUserApplications } from '../../hooks/useApplications';

export default function ViewUserProfileModal({ isOpen, onClose, user }) {
  useEscapeKey(onClose);

  const { data: selectedUserProfile, isLoading: loadingProfile } = useUserProfile(user?.id);
  const { data: userApplications = [], isLoading: loadingApplications } = useUserApplications(user?.role === 'candidate' ? user?.id : null);

  if (!isOpen || !user) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
    if (score >= 50) return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20';
    return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {loadingProfile ? (
          <div className="p-12 text-center space-y-4 animate-pulse flex flex-col items-center">
            <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-[1.5rem]"></div>
            <div className="w-48 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
          </div>
        ) : selectedUserProfile ? (
          <>
            <div className="relative p-6 md:p-8 flex justify-between items-start bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-800/50 dark:to-zinc-900 border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-5">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUserProfile.full_name || user.full_name)}&background=0f172a&color=fff&size=128`}
                  className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white dark:border-zinc-900 shadow-md transform -rotate-2 hover:rotate-0 transition-transform duration-300"
                  alt={selectedUserProfile.full_name || user.full_name}
                />
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">{selectedUserProfile.full_name || user.full_name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {user.role}
                    </span>
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                        <Ban className="w-3 h-3" /> Deactivated
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-sm"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-zinc-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Info Cards */}
                <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Email Address</p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pl-13 truncate">{selectedUserProfile.email || user.email}</p>
                </div>

                <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                      <Phone className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Phone Number</p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pl-13">{selectedUserProfile.phone || 'Not provided'}</p>
                </div>

                <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                      <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Joined Date</p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pl-13">{new Date(selectedUserProfile.created_at || user.created_at).toLocaleDateString()}</p>
                </div>

                {selectedUserProfile.current_company && (
                  <div className="bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                        <Briefcase className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Current Company</p>
                    </div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pl-13 truncate">{selectedUserProfile.current_company}</p>
                  </div>
                )}
              </div>

              {(selectedUserProfile.skills?.length > 0 || selectedUserProfile.experience_years != null) && (
                <div className="mt-8 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {selectedUserProfile.experience_years != null && (
                      <div className="md:w-1/3">
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Experience</p>
                        <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                          {selectedUserProfile.experience_years} <span className="text-sm font-bold text-zinc-500 dark:text-zinc-500">years</span>
                        </p>
                      </div>
                    )}
                    {selectedUserProfile.skills?.length > 0 && (
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Skills & Technologies</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedUserProfile.skills.map((s, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl shadow-sm">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedUserProfile.bio && (
                <div className="mt-8 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/20 dark:bg-indigo-500/10 rounded-l-3xl"></div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Biography</p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedUserProfile.bio}</p>
                </div>
              )}

              {user.role === 'candidate' && (
                <div className="mt-8">
                  <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    Application History
                  </h3>
                  {loadingApplications ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-full"></div>
                      <div className="h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-full"></div>
                    </div>
                  ) : userApplications.length === 0 ? (
                    <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center">
                      <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold">This candidate has not applied to any jobs yet.</p>
                    </div>
                  ) : (
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <th className="px-5 py-4 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Job Details</th>
                            <th className="px-5 py-4 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center">AI Score</th>
                            <th className="px-5 py-4 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                          {userApplications.map(app => (
                            <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                              <td className="px-5 py-4">
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{app.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500">{app.company_name}</p>
                                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                                  <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600">{new Date(app.applied_at).toLocaleDateString()}</p>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl border-2 font-black text-xs shadow-sm ${getScoreColor(app.ai_match_score)}`}>
                                  {app.ai_match_score}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl shadow-sm inline-block">
                                  {app.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

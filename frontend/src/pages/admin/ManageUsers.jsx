import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { Users, Search, Plus, Shield, UserCircle, Briefcase, Mail, Phone, Calendar, X, Ban, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'candidate'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      // Exclude the currently logged-in admin from the list
      const filteredUsers = (response.data.users || []).filter(u => u.id !== currentUser.id);
      setUsers(filteredUsers);
    } catch (err) {
      toast.error("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users', userForm);
      toast.success("User created successfully!");
      setIsNewUserModalOpen(false);
      setUserForm({ fullName: '', email: '', password: '', role: 'candidate' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openProfile = async (user) => {
    try {
      const response = await api.get(`/users/${user.id}/profile`);
      setSelectedUser(response.data.user);
      setIsProfileModalOpen(true);
      if (user.role === 'candidate') {
        fetchUserApplications(user.id);
      }
    } catch (err) {
      toast.error("Failed to load profile details");
    }
  };

  const fetchUserApplications = async (userId) => {
    try {
      const response = await api.get(`/applications/user/${userId}`);
      setUserApplications(response.data.applications || []);
    } catch (err) {
      toast.error("Failed to fetch user applications");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const handleToggleUserStatus = async (user) => {
    const action = user.is_active ? "deactivate" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      await api.patch(`/users/${user.id}/toggle-status`);
      toast.success(`User ${action}d successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${action} user`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && user.is_active) || 
                          (statusFilter === 'deactivated' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Users</h1>
          <p className="text-slate-500 font-medium mt-1">Directory of all Candidates, HR, and Admins.</p>
        </div>
        <button
          onClick={() => setIsNewUserModalOpen(true)}
          className="inline-flex items-center justify-center h-10 px-4 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-300 transition-all active:scale-95 gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New User
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none shadow-sm"
          />
        </div>
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none shadow-sm"
          >
            <option value="all">All Roles</option>
            <option value="candidate">Candidate</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none shadow-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto min-h-[400px] flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className={`hover:bg-slate-50/50 transition-colors ${!u.is_active ? 'opacity-60 bg-slate-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=f1f5f9&color=0f172a`}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 grayscale"
                            style={{ filter: !u.is_active ? 'grayscale(100%)' : 'none' }}
                            alt={u.full_name}
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{u.full_name}</p>
                            <p className="text-xs font-medium text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === 'admin' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-100"><Shield className="w-3 h-3" /> Admin</span>}
                        {u.role === 'hr' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100"><Briefcase className="w-3 h-3" /> HR</span>}
                        {u.role === 'candidate' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100"><UserCircle className="w-3 h-3" /> Candidate</span>}
                      </td>
                      <td className="px-6 py-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4"/> Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500"><Ban className="w-4 h-4"/> Deactivated</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openProfile(u)}
                            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors"
                          >
                            View Profile
                          </button>
                          {u.is_active ? (
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5"
                              title="Deactivate User"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className="px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
                              title="Reactivate User"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                      No users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <p className="text-sm font-medium text-slate-500">
                Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-bold text-slate-900">{filteredUsers.length}</span> results
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4"/>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                        currentPage === page ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NEW USER MODAL */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsNewUserModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900">Create New User</h2>
              <button onClick={() => setIsNewUserModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input required type="text" value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Email Address *</label>
                <input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Password *</label>
                <input required type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none">
                  <option value="candidate">Candidate</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-4">
                <button disabled={isSubmitting} type="submit" className="w-full h-12 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {isProfileModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsProfileModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.full_name)}&background=f1f5f9&color=0f172a`}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm"
                  alt={selectedUser.full_name}
                />
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedUser.full_name}</h2>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">{selectedUser.role}</p>
                </div>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-1"><Mail className="w-4 h-4" /> {selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-1"><Phone className="w-4 h-4" /> {selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-1"><Calendar className="w-4 h-4" /> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedUser.current_company && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Company</p>
                      <p className="text-sm font-bold text-slate-700 mt-1">{selectedUser.current_company}</p>
                    </div>
                  )}
                  {selectedUser.experience_years != null && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</p>
                      <p className="text-sm font-bold text-slate-700 mt-1">{selectedUser.experience_years || 0} years</p>
                    </div>
                  )}
                  {selectedUser.skills && selectedUser.skills.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.skills.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedUser.bio && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bio</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{selectedUser.bio}</p>
                </div>
              )}

              {selectedUser.role === 'candidate' && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-black text-slate-900 mb-4">Application History</h3>
                  {userApplications.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm font-medium">
                      This candidate has not applied to any jobs yet.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Job Title</th>
                            <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Applied On</th>
                            <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest text-center">AI Score</th>
                            <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {userApplications.map(app => (
                            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3">
                                <p className="text-sm font-bold text-slate-900">{app.title}</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">{app.company_name}</p>
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-slate-600">
                                {new Date(app.applied_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-black text-xs ${getScoreColor(app.ai_match_score)}`}>
                                  {app.ai_match_score}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">{app.status}</span>
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
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

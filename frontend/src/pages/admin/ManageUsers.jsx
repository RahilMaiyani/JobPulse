import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { useUsers, useCreateUser, useToggleUserStatus, useDeleteUser } from '../../hooks/useUsers';
import { Users, Search, Plus, Shield, UserCircle, Briefcase, X, Ban, CheckCircle2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import ManageUsersSkeleton from '../../components/skeletons/ManageUsersSkeleton';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ViewUserProfileModal from '../../components/modals/ViewUserProfileModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';

export default function ManageUsers() {
  const { user: currentUser } = useAuth();

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
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: true, confirmText: 'Confirm' });

  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'candidate'
  });

  const { data: users = [], isLoading: loading } = useUsers(currentUser.id);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const createUserMutation = useCreateUser(() => {
    setIsNewUserModalOpen(false);
    setUserForm({ fullName: '', email: '', password: '', role: 'candidate' });
  });

  const handleCreateUser = (e) => {
    e.preventDefault();
    createUserMutation.mutate(userForm);
  };

  const openProfile = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const toggleStatusMutation = useToggleUserStatus();

  const handleToggleUserStatus = (user) => {
    const action = user.is_active ? "deactivate" : "reactivate";
    setConfirmModal({
      isOpen: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      message: `Are you sure you want to ${action} ${user.full_name}?`,
      confirmText: action === "deactivate" ? "Deactivate" : "Reactivate",
      isDestructive: action === "deactivate",
      onConfirm: () => toggleStatusMutation.mutate({ userId: user.id, action })
    });
  };

  const deleteUserMutation = useDeleteUser();
  const handleDeleteUser = (user) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete User",
      message: `Are you sure you want to completely delete ${user.full_name}? This action cannot be undone.`,
      confirmText: "Delete",
      isDestructive: true,
      onConfirm: () => deleteUserMutation.mutate(user.id)
    });
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
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Manage Users</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2 text-sm">Directory of all Candidates, HR, and Admins.</p>
        </div>
        <button
          onClick={() => setIsNewUserModalOpen(true)}
          className="inline-flex items-center justify-center h-12 px-6 font-black text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white rounded-2xl shadow-xl shadow-zinc-200 dark:shadow-none transition-all active:scale-95 hover:-translate-y-0.5 gap-2 whitespace-nowrap duration-300"
        >
          <Plus className="w-5 h-5" />
          New User
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm dark:shadow-none transition-all"
          />
        </div>
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full h-12 px-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm dark:shadow-none transition-all cursor-pointer appearance-none"
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
            className="w-full h-12 px-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm dark:shadow-none transition-all cursor-pointer appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <ManageUsersSkeleton count={5} />
      ) : (
        <>
        {/* Mobile Grid View */}
        <div className="grid md:hidden grid-cols-1 gap-4 mb-4">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((u) => (
              <div key={u.id} className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col gap-4 ${!u.is_active ? 'opacity-70 grayscale' : ''}`}>
                <div className="flex items-center gap-3">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=f1f5f9&color=0f172a`} className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover" alt={u.full_name} />
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{u.full_name}</h3>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-y border-zinc-100 dark:border-zinc-800/60 py-3">
                  <div className="flex flex-wrap gap-2">
                    {u.role === 'admin' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20"><Shield className="w-3 h-3" /> Admin</span>}
                    {u.role === 'hr' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20"><Briefcase className="w-3 h-3" /> HR</span>}
                    {u.role === 'candidate' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"><UserCircle className="w-3 h-3" /> Candidate</span>}
                  </div>
                  <div>
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-500"><Ban className="w-4 h-4" /> Deact</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => openProfile(u)} className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Profile</button>
                  <button onClick={() => handleToggleUserStatus(u)} className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-colors ${u.is_active ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 hover:bg-rose-100' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100'}`}>
                    {u.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  {!u.is_active && (
                    <button onClick={() => handleDeleteUser(u)} className="w-11 h-11 flex items-center justify-center rounded-xl border transition-colors text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 font-medium bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl">No users found.</div>
          )}
        </div>
        {/* Desktop Table View */}
        <div className="hidden md:flex bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2rem] shadow-xl shadow-zinc-200/20 dark:shadow-none overflow-hidden flex-col relative">
          <div className="overflow-x-auto min-h-[400px] flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/60">
                  <th className="px-6 py-5 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">User</th>
                  <th className="px-6 py-5 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-5 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group ${!u.is_active ? 'opacity-60 bg-zinc-50/50 dark:bg-zinc-900/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=f1f5f9&color=0f172a`}
                            className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 grayscale"
                            style={{ filter: !u.is_active ? 'grayscale(100%)' : 'none' }}
                            alt={u.full_name}
                          />
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{u.full_name}</p>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {u.role === 'admin' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20"><Shield className="w-3 h-3" /> Admin</span>}
                          {u.role === 'hr' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20"><Briefcase className="w-3 h-3" /> HR</span>}
                          {u.role === 'candidate' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"><UserCircle className="w-3 h-3" /> Candidate</span>}
                          {u.is_hired && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20"><CheckCircle2 className="w-3 h-3" /> Hired</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-500"><Ban className="w-4 h-4" /> Deactivated</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openProfile(u)}
                            className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl shadow-sm hover:shadow transition-all active:scale-95"
                          >
                            Profile
                          </button>
                          {u.is_active ? (
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className="w-8 h-8 flex items-center justify-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/30 rounded-xl transition-all active:scale-95"
                              title="Deactivate User"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className="w-8 h-8 flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 rounded-xl transition-all active:scale-95"
                                title="Reactivate User"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="w-8 h-8 flex items-center justify-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/30 rounded-xl transition-all active:scale-95"
                                title="Delete User Completely"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-500">
                      No users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between bg-white dark:bg-zinc-950">
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Showing <span className="text-zinc-700 dark:text-zinc-300">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-zinc-700 dark:text-zinc-300">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="text-zinc-700 dark:text-zinc-300">{filteredUsers.length}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl text-xs font-black flex items-center justify-center transition-all ${currentPage === page ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-110' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-105'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        </>
      )}

      {/* NEW USER MODAL */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsNewUserModalOpen(false)}></div>
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-6 md:p-8 flex justify-between items-start bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/60">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Create New User</h2>
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Add to directory</p>
              </div>
              <button onClick={() => setIsNewUserModalOpen(false)} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 md:p-8 space-y-5 bg-white dark:bg-zinc-950">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Full Name *</label>
                <input required type="text" value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} className="w-full h-12 px-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" placeholder="John Doe" />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Email Address *</label>
                <input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full h-12 px-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" placeholder="john@example.com" />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Password *</label>
                <input required type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full h-12 px-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" placeholder="••••••••" />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full h-12 px-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer appearance-none">
                  <option value="candidate">Candidate</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-6">
                <button disabled={createUserMutation.isPending} type="submit" className="w-full h-12 font-black text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white rounded-2xl shadow-xl shadow-zinc-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 hover:-translate-y-0.5 duration-300">
                  {createUserMutation.isPending ? <div className="w-5 h-5 border-2 border-zinc-400 dark:border-zinc-400 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></div> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      <ViewUserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={selectedUser} 
      />

      <ConfirmationModal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        isDestructive={confirmModal.isDestructive}
        confirmText={confirmModal.confirmText}
      />
    </DashboardLayout>
  );
}

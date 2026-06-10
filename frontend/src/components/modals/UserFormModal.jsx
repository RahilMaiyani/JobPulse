import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useCreateUser } from '../../hooks/useUsers';
import useEscapeKey from '../../hooks/useEscapeKey';

export default function UserFormModal({ isOpen, onClose }) {
  useEscapeKey(onClose);

  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'candidate'
  });

  const createUserMutation = useCreateUser(() => {
    onClose();
    setUserForm({ fullName: '', email: '', password: '', role: 'candidate' });
  });

  const handleCreateUser = (e) => {
    e.preventDefault();
    createUserMutation.mutate(userForm);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[85dvh]">
        <div className="p-6 md:p-8 flex justify-between items-start bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/60 shrink-0">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Create New User</h2>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Add to directory</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleCreateUser} className="p-6 md:p-8 space-y-5 bg-white dark:bg-zinc-950 overflow-y-auto custom-scrollbar flex-1">
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
    </div>,
    document.body
  );
}

import React, { useState } from 'react';
import { useContactMessages, useMarkMessageAsRead, useArchiveMessage } from '../../hooks/useContact';
import { Mail, Archive, CheckCircle, Search, User, Clock, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLoader from '../../components/PageLoader';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function AdminContactMessages() {
  const { data: messages, isLoading } = useContactMessages();
  const markAsReadMutation = useMarkMessageAsRead();
  const archiveMutation = useArchiveMessage();
  const [searchTerm, setSearchTerm] = useState('');

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Are you sure you want to archive this message?')) return;
    try {
      await archiveMutation.mutateAsync(id);
      toast.success('Message archived');
    } catch (error) {
      toast.error('Failed to archive message');
    }
  };

  if (isLoading) return <PageLoader />;

  const filteredMessages = messages?.filter(msg => 
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    msg.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender_email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-slate-900 dark:text-zinc-100" />
            Contact Messages
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mt-1">View and manage messages from candidates</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 h-10 pl-9 pr-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-100 outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">No Messages</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                onClick={() => handleMarkAsRead(msg.id, msg.is_read)}
                className={`p-5 transition-colors cursor-pointer group ${msg.is_read ? 'bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/50' : 'bg-slate-50/50 dark:bg-zinc-800/30 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${msg.is_read ? 'bg-transparent' : 'bg-slate-900 dark:bg-zinc-100'}`}></div>
                        <h3 className={`font-bold text-slate-900 dark:text-zinc-100 ${msg.is_read ? 'text-base' : 'text-base'}`}>{msg.subject}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {msg.sender_name} ({msg.sender_email})</span>
                        <span className="text-slate-300 dark:text-zinc-600">•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className={`text-sm ${msg.is_read ? 'text-slate-500 dark:text-zinc-400 font-medium' : 'text-slate-700 dark:text-zinc-300 font-semibold'} whitespace-pre-wrap pl-4`}>
                      {msg.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!msg.is_read && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(msg.id, msg.is_read); }}
                        className="p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                        title="Mark as Read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleArchive(msg.id); }}
                      className="p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                      title="Archive Message"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}

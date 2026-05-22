import { useState } from "react";
import { useAnnouncements, useArchiveAnnouncement } from "../hooks/useAnnouncements";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, Megaphone, Calendar, Award, X, Clock, Edit2, TimerOff } from "lucide-react";
import CreateAnnouncementModal from "./CreateAnnouncementModal";
import ArchiveModal from "./ArchiveModal";

export default function AnnouncementFeed() {
  const { data: announcements = [], isLoading } = useAnnouncements();
  
  const { mutate: archive, isPending: isArchiving } = useArchiveAnnouncement();

  
  const currentDateTime = new Date();
  
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [announcementToArchive, setAnnouncementToArchive] = useState(null);

  if (isLoading) return null;

  const visibleAnnouncements = announcements.filter(a => {
    if (a.status !== "Active") return false;
    if (isAdmin) return true; 
    return a.targetDepartments.includes("All") || a.targetDepartments.includes(user?.department);
  });

  if (visibleAnnouncements.length === 0) return null;

  const getIconAndColor = (type) => {
    switch (type) {
      case "Urgent": return { icon: <AlertTriangle className="w-5 h-5 text-rose-600" />, bg: "bg-rose-50 border-rose-200", text: "text-rose-900" };
      case "Event": return { icon: <Calendar className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-900" };
      case "Milestone": return { icon: <Award className="w-5 h-5 text-teal-600" />, bg: "bg-teal-50 border-teal-200", text: "text-teal-900" };
      default: return { icon: <Megaphone className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-900" };
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-slate-400" /> Company Broadcasts
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {visibleAnnouncements.map((announcement) => {
          const style = getIconAndColor(announcement.type);
          // console.log(announcement);
          return (
            <div key={announcement._id} className={`relative p-5 rounded-2xl border shadow-sm ${style.bg}`}>
              
              {/* ADMIN ACTIONS: Edit & Archive */}
              {isAdmin && (
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button 
                    onClick={() => setEditingAnnouncement(announcement)}
                    className="p-1.5 bg-white/50 hover:bg-white rounded-full text-slate-500 hover:text-indigo-600 transition-colors"
                    title="Edit Announcement"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setAnnouncementToArchive(announcement)}
                    className="p-1.5 bg-white/50 hover:bg-white rounded-full text-slate-500 hover:text-rose-600 transition-colors"
                    title="Archive Announcement"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-4 items-start pr-16">
                <div className="p-2.5 bg-white rounded-xl shadow-sm shrink-0">
                  {style.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-base font-bold leading-tight ${style.text}`}>
                      {announcement.title}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/60 rounded-md text-slate-600">
                      {announcement.type}
                    </span>
                    {isAdmin && !announcement.targetDepartments.includes("All") && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                        {announcement.targetDepartments.join(", ")}
                      </span>
                    )}
                    { currentDateTime > new Date(announcement.expiresAt) ?  
                    <div>
                        <TimerOff className="w-4 h-4 text-red-600 animate-pulse"/>
                    </div>   :  ""}
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium mt-1">
                    {announcement.message}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs font-bold text-slate-500">
                    <span>Posted by {announcement.createdBy?.name || "Admin"}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 
                      Expires {new Date(announcement.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODALS */}
      <CreateAnnouncementModal 
        isOpen={!!editingAnnouncement} 
        onClose={() => setEditingAnnouncement(null)} 
        initialData={editingAnnouncement}
      />

      <ArchiveModal
        isOpen={!!announcementToArchive}
        onClose={() => setAnnouncementToArchive(null)}
        title={announcementToArchive?.title}
        isArchiving={isArchiving}
        onConfirm={() => {
          archive(announcementToArchive._id, {
            onSuccess: () => setAnnouncementToArchive(null)
          });
        }}
      />
    </div>
  );
}
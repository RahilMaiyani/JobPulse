import { useState, useMemo, useEffect } from "react";
import { X, Send, Megaphone, Loader2, Building } from "lucide-react";
import { useCreateAnnouncement, useUpdateAnnouncement } from "../hooks/useAnnouncements";
import { useUsers } from "../hooks/useUsers";

export default function CreateAnnouncementModal({ isOpen, onClose, initialData = null }) {
  const { data: users = [] } = useUsers();
  
  const uniqueDepartments = useMemo(() => {
    const depts = users.map(u => u.department).filter(Boolean);
    return Array.from(new Set(depts)).sort((a, b) => a[0].localeCompare(b[0]));
  }, [users]);

  const getLocalISOString = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const now = new Date();
  const minDateTime = getLocalISOString(now);
  const maxDateTime = getLocalISOString(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "General",
    targetDepartments: ["All"],
    expiresAt: "" 
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        message: initialData.message,
        type: initialData.type,
        targetDepartments: initialData.targetDepartments || ["All"],
        expiresAt: getLocalISOString(new Date(initialData.expiresAt))
      });
    } else {
      setFormData({
        title: "",
        message: "",
        type: "General",
        targetDepartments: ["All"],
        expiresAt: maxDateTime
      });
    }
  }, [initialData, isOpen]);

  const { mutate: create, isPending: isCreating } = useCreateAnnouncement(onClose);
  const { mutate: update, isPending: isUpdating } = useUpdateAnnouncement(onClose);
  const isPending = isCreating || isUpdating;

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (initialData) update({ id: initialData._id, data: formData });
    else create(formData);
  };

  const handleDeptToggle = (dept) => {
    if (dept === "All") return setFormData({ ...formData, targetDepartments: ["All"] });
    let newDepts = formData.targetDepartments.includes("All") ? [] : [...formData.targetDepartments];
    if (newDepts.includes(dept)) newDepts = newDepts.filter(d => d !== dept);
    else newDepts.push(dept);
    setFormData({ ...formData, targetDepartments: newDepts.length === 0 ? ["All"] : newDepts });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
        
        {/* HEADER */}
        <div className="bg-white p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md">
              {initialData ? "Edit Mode" : "Broadcast"}
            </span>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {initialData ? "Edit Announcement" : "New Announcement"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-2 bg-slate-50 rounded-full transition-all shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 bg-slate-50/30">
          <form id="announcement-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Headline</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="General">General Notice</option>
                  <option value="Urgent">Urgent Alert</option>
                  <option value="Event">Event / Holiday</option>
                  <option value="Milestone">Milestone</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Auto-Archive Date</label>
                <input 
                  type="datetime-local" 
                  required
                  min={minDateTime}
                  max={maxDateTime}
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Target Departments */}
            <div className="space-y-2 bg-white p-3.5 border border-slate-200 rounded-xl shadow-sm">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Building className="w-3 h-3" /> Target Department
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDeptToggle("All")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                    formData.targetDepartments.includes("All") 
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Entire Company
                </button>
                {uniqueDepartments.map(dept => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleDeptToggle(dept)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                      formData.targetDepartments.includes(dept) && !formData.targetDepartments.includes("All")
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message Details</label>
              <textarea
                required
                rows="3"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
              />
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-widest">
            Cancel
          </button>
          <button type="submit" form="announcement-form" disabled={isPending} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
            {initialData ? "Save Changes" : "Publish Broadcast"}
          </button>
        </div>

      </div>
    </div>
  );
}
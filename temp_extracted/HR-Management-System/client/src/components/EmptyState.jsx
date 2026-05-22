import { Calendar, Clock, Inbox } from 'lucide-react';

export default function EmptyState({ 
  message = "No records found", 
  isTable = false, 
  colSpan = 4,
  iconType = "default" 
}) {
  // Select icon based on context
  const icons = {
    leave: <Calendar className="w-10 h-10 text-indigo-400" />,
    attendance: <Clock className="w-10 h-10 text-emerald-400" />,
    default: <Inbox className="w-10 h-10 text-slate-300" />
  };

  const content = (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Icon Wrapper with soft glow/shadow */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-slate-100 rounded-full scale-150 blur-xl opacity-50" />
        <div className="relative bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          {icons[iconType] || icons.default}
        </div>
      </div>
      
      {/* Text Content */}
      <h3 className="text-slate-800 font-bold text-base mb-1">Nothing here yet</h3>
      <p className="text-slate-400 text-xs font-medium max-w-50 leading-relaxed">
        {message}
      </p>
    </div>
  );

  if (isTable) {
    return (
      <tr>
        <td colSpan={colSpan} className="p-0">
          <div className="bg-slate-50/30">
            {content}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl transition-all duration-300 hover:border-slate-300">
      {content}
    </div>
  );
}
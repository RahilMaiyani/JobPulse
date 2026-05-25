import React from 'react';

export default function MyApplicationsSkeleton({ count = 5 }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Role & Company</th>
            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Applied On</th>
            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">AI Score</th>
            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: count }).map((_, n) => (
            <tr key={n} className="animate-pulse">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0"></div>
                  <div className="space-y-1">
                    <div className="h-5 w-32 bg-slate-200 rounded"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </td>
              <td className="p-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
              <td className="p-4"><div className="w-10 h-10 bg-slate-200 rounded-xl"></div></td>
              <td className="p-4 text-right"><div className="h-6 w-20 bg-slate-200 rounded-full ml-auto"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

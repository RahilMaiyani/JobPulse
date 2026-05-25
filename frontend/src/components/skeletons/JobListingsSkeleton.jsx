import React from 'react';

export default function JobListingsSkeleton({ count = 5 }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Role</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Type</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hidden sm:table-cell">Deadline</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: count }).map((_, n) => (
            <tr key={n} className="animate-pulse">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0"></div>
                  <div className="space-y-1">
                    <div className="h-6 w-32 bg-slate-200 rounded"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-20 bg-slate-200 rounded"></div></td>
              <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 rounded-md"></div></td>
              <td className="px-6 py-4 hidden sm:table-cell"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
              <td className="px-6 py-4 text-right"><div className="h-9 w-9 bg-slate-200 rounded-lg ml-auto"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

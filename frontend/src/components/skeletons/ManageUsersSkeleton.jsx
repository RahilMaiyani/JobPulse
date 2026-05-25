import React from 'react';

export default function ManageUsersSkeleton({ count = 5 }) {
  return (
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
            {Array.from({ length: count }).map((_, n) => (
              <tr key={n} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                    <div className="space-y-1">
                      <div className="h-5 w-32 bg-slate-200 rounded"></div>
                      <div className="h-4 w-40 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-200 rounded-md"></div></td>
                <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded"></div></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-9 w-24 bg-slate-200 rounded-lg"></div>
                    <div className="h-9 w-24 bg-slate-200 rounded-lg"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

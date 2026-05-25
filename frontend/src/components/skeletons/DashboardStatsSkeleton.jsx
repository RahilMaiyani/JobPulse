import React from 'react';

export default function DashboardStatsSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-3">
            <div className="w-24 h-4 bg-slate-200 rounded"></div>
            <div className="w-16 h-8 bg-slate-200 rounded"></div>
          </div>
          <div className="w-14 h-14 rounded-xl bg-slate-200"></div>
        </div>
      ))}
    </div>
  );
}

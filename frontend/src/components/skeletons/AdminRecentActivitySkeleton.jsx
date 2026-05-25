import React from 'react';

export default function AdminRecentActivitySkeleton({ count = 3 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-32 h-6 bg-slate-200 rounded"></div>
            <div className="w-24 h-3 bg-slate-200 rounded"></div>
          </div>
          <div className="w-20 h-6 bg-slate-200 rounded-md"></div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';

export default function JobCardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-slate-200 mb-4"></div>
          <div className="w-3/4 h-7 bg-slate-200 rounded mb-1"></div>
          <div className="w-1/2 h-4 bg-slate-200 rounded mb-4"></div>
          <div className="pt-4 border-t border-slate-100">
            <div className="w-24 h-5 bg-slate-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

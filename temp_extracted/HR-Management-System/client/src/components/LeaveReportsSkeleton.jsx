export default function LeaveReportsSkeleton() {
  return (
    <div className="animate-pulse space-y-8 w-full">
      
      {/* HEADER SKELETON */}
      <header className="flex items-end justify-between border-b border-slate-200 pb-6">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-96 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-4 w-24 bg-slate-100 rounded-sm"></div>
      </header>

      {/* FILTERS CARD SKELETON */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-3 w-32 bg-slate-100 rounded-sm mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-1.5 h-10 bg-slate-100 rounded-lg"></div>
          <div className="h-10 bg-slate-50 rounded-lg"></div>
          <div className="h-10 bg-slate-50 rounded-lg"></div>
          <div className="h-10 bg-slate-50 rounded-lg"></div>
          <div className="h-10 bg-rose-50/50 rounded-lg"></div>
        </div>
      </div>

      {/* TABLE SKELETON */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Head */}
        <div className="bg-slate-50 h-12 border-b border-slate-200"></div>
        
        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="px-6 py-5 flex items-center justify-between">
              
              {/* Employee Column (Avatar + Info) */}
              <div className="flex items-center gap-3 w-1/3">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                <div className="space-y-2 w-full">
                  <div className="h-4 w-32 bg-slate-200 rounded-sm"></div>
                  <div className="h-3 w-40 bg-slate-100 rounded-sm"></div>
                </div>
              </div>

              {/* Leave Type Column */}
              <div className="w-1/6">
                <div className="h-4 w-20 bg-slate-100 rounded-sm"></div>
              </div>

              {/* Duration Column */}
              <div className="w-1/4">
                <div className="h-4 w-44 bg-slate-100 rounded-sm"></div>
              </div>

              {/* Status Column (Right aligned capsule) */}
              <div className="w-1/6 flex justify-end">
                <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
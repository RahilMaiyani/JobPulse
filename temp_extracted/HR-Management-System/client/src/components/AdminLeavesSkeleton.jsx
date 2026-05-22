export default function AdminLeavesSkeleton() {
  return (
    <div className="animate-pulse space-y-8 w-full">
      
      {/* HEADER SKELETON */}
      <header className="flex items-end justify-between border-b border-slate-200 pb-6">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-96 bg-slate-100 rounded-md"></div>
        </div>
        {/* Pending Badge Skeleton */}
        <div className="h-7 w-40 bg-slate-100 rounded-full"></div>
      </header>

      {/* TABLE SKELETON */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Head */}
        <div className="bg-slate-50 h-12 border-b border-slate-200"></div>
        
        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="px-6 py-5 flex items-center justify-between">
              
              {/* Employee Col (Avatar + Double Text) */}
              <div className="flex items-center gap-3 w-1/4">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                <div className="space-y-2 w-full">
                  <div className="h-4 w-3/4 bg-slate-200 rounded-sm"></div>
                  <div className="h-3 w-1/2 bg-slate-100 rounded-sm"></div>
                </div>
              </div>

              {/* Type Col */}
              <div className="w-1/6">
                <div className="h-4 w-20 bg-slate-100 rounded-sm"></div>
              </div>

              {/* Duration Col */}
              <div className="w-1/4">
                <div className="h-4 w-48 bg-slate-100 rounded-sm"></div>
              </div>

              {/* Status Col */}
              <div className="w-1/6">
                <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
              </div>

              {/* Action Col */}
              <div className="w-1/6 flex justify-end gap-2">
                <div className="w-9 h-9 rounded-lg bg-slate-100"></div>
                <div className="w-9 h-9 rounded-lg bg-slate-100"></div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
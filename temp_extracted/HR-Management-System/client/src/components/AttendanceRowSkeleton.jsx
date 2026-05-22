
import Skeleton from "./Skeleton";

export default function AttendanceRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
      
      {/* DATE COLUMN SKELETON */}
      <div className="flex items-center gap-5 min-w-42.5">
        {/* The square date block */}
        <Skeleton className="w-14 h-14 rounded-2xl" /> 
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" /> {/* Weekday name */}
          <Skeleton className="h-2 w-16" /> {/* "Shift Session" subtext */}
        </div>
      </div>

      {/* TIMES COLUMN SKELETON */}
      <div className="flex items-center gap-16 lg:gap-24">
        <div className="flex flex-col items-center min-w-22.5 space-y-2">
          <Skeleton className="h-2 w-10" /> {/* "Check In" label */}
          <Skeleton className="h-4 w-14" /> {/* Time value */}
        </div>
        <div className="flex flex-col items-center min-w-22.5 space-y-2">
          <Skeleton className="h-2 w-10" /> {/* "Check Out" label */}
          <Skeleton className="h-4 w-14" /> {/* Time value */}
        </div>
      </div>

      {/* STATUS COLUMN SKELETON */}
      <div className="flex items-center gap-10">
        <div className="flex flex-col items-end min-w-17.5 space-y-2">
          <Skeleton className="h-2 w-8" />  {/* "Hours" label */}
          <Skeleton className="h-4 w-12" /> {/* Duration value */}
        </div>
        <div className="min-w-30 flex justify-end">
          <Skeleton className="h-8 w-24 rounded-lg" /> {/* Status Badge */}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useTitle } from "../hooks/useTitle";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
} from "lucide-react";
import { useAttendanceHistory, useFilterAttendance } from "../hooks/useAttendance";
import AttendanceRowSkeleton from "../components/AttendanceRowSkeleton";
import EmptyState from "../components/EmptyState";

export default function AttendanceHistory() {
  useTitle("Attendance");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);

  const { data: filterData } = useFilterAttendance();

  useEffect(() => {
    if (filterData && filterData.length > 0) {
      setSelectedYear(filterData[0]._id.year);
      setSelectedMonth(filterData[0]._id.month);
    }
  }, [filterData]);

  const { data, isLoading, isFetching } = useAttendanceHistory(selectedMonth, selectedYear, page);

  const { logs = [], pagination = {} } = data || {};

  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";
    const date = new Date(timeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMonthName = (num) => {
    return new Date(0, num - 1).toLocaleString('en-US', { month: 'long' });
  };

  return (
    <DashboardLayout>
      <div className="p-10 max-w-6xl mx-auto space-y-6 min-h-screen">
        
        {/* DYNAMIC FILTER HEADER */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-100">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Archive</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Records for {getMonthName(selectedMonth)} {selectedYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Year Selector */}
            <select 
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
              className="pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer"
            >
              {[...new Set(filterData?.map(f => f._id.year))].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Month Selector */}
            <select 
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(e.target.value); setPage(1); }}
              className="pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer"
            >
              {filterData
                ?.filter(f => f._id.year === parseInt(selectedYear))
                .map(f => (
                  <option key={f._id.month} value={f._id.month}>
                    {getMonthName(f._id.month)}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="relative space-y-3">
          {isFetching && <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 rounded-3xl" />}
          {isLoading ? (
                [...Array(5)].map((_, i) => <AttendanceRowSkeleton key={i} />)
          ) : (
          logs.length > 0 ? (
            logs.map((log) => (
              <div 
                key={log._id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between hover:border-indigo-200 transition-all group"
              >
                {/* DATE COLUMN */}
                <div className="flex items-center gap-5 min-w-42.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase leading-none">
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    
                    <span className="text-xl font-black text-slate-700 group-hover:text-indigo-600 transition-colors mt-1">
                      {new Date(log.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Shift Session</p>
                  </div>
                </div>

                {/* TIMES COLUMN (IDENTICAL WIDTHS) */}
                <div className="flex items-center gap-16 lg:gap-24">
                  <div className="text-center min-w-22.5">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Check In</p>
                    <p className="text-sm font-bold text-slate-700 tabular-nums">{formatTime(log.checkIn)}</p>
                  </div>
                  <div className="text-center min-w-22.5">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Check Out</p>
                    <p className="text-sm font-bold text-slate-700 tabular-nums">{formatTime(log.checkout)}</p>
                  </div>
                </div>

                {/* STATUS COLUMN (IDENTICAL WIDTHS) */}
                <div className="flex items-center gap-10">
                  <div className="text-right min-w-17.5">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Hours</p>
                    <p className="text-sm font-bold text-slate-500">
                      {(() => {
                        if (!log.checkout || !log.checkIn) return "--";
                        
                        const diffInMs = new Date(log.checkout) - new Date(log.checkIn);
                        
                        let minutes = Math.round((diffInMs % 3600000) / 60000);
                        let hours = Math.floor(diffInMs / 3600000);
                        
                        if( minutes === 60){
                          hours += 1;
                          minutes = 0;
                        }
                        
                        return `${hours}h ${minutes}m`;
                      })()}  
                    </p>
                  </div>
                  <div className="min-w-30 flex justify-end">
                    <span className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                      log.checkout 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                    }`}>
                      {log.checkout ? "Completed" : "Active"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              iconType="attendance"
              message="You haven't logged any shifts for this month yet."
            />
          )
        )}
        </div>

        {/* PAGINATION */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="p-2 bg-indigo-600 rounded-xl disabled:opacity-30 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
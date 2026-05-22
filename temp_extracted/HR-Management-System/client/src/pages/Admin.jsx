import DashboardLayout from "../layouts/DashboardLayout";
import { useUsers } from "../hooks/useUsers";
import { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTitle } from "../hooks/useTitle";
import AttendanceChart from "../components/charts/AttendanceChart";
import LeaveStatusChart from "../components/charts/LeaveStatusChart";
import LeaveTrendChart from "../components/charts/LeaveTrendChart";
import AdminDashboardSkeleton from "../components/AdminDashboardSkeleton";
import SmartTriggerBanner from "../components/SmartTriggerBanner";
import CreateAnnouncementModal from "../components/CreateAnnouncementModal";
import AnnouncementFeed from "../components/AnnouncementFeed";
import DataIntegrityAlert from '../components/DataIntegrityAlert'; 

import EmailModal from "../components/EmailModal";
import HoverItem from "../components/HoverItem";

import { useAllLeaves, useRecentLeaves } from "../hooks/useLeaves";
import { useAllAttendance } from "../hooks/useAttendance";

// Add these to your existing imports at the top
import { usePunctualityAnalytics } from "../hooks/useAnalytics"; // Ensure you created this hook!
import PunctualityChart from "../components/charts/PunctualityChart";

import { 
  Users,
  BarChart3, 
  CalendarCheck,
  Mail,
  ArrowUpRight,
  RefreshCw,
  Megaphone,
  CalendarDays,
  TrendingUp,
  Clock,
  AlertTriangle
} from "lucide-react";

export default function Admin() {
  useTitle("Admin");
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useUsers();
  const { data: leaves = [] } = useAllLeaves();
  const { data: recentLeaves = [] } = useRecentLeaves();

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [emailUser, setEmailUser] = useState(null);
  const [emailTemplate, setEmailTemplate] = useState(null);

  const [customTimes, setCustomTimes] = useState({});

  const { data: allAttendance, isPending, isError } = useAllAttendance();

  const fetchAttendance = async () => {
    try {
      setAttendance(allAttendance);
    } catch (err) {
      console.error("Attendance fetch error:", err); 
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [allAttendance, isPending, isError]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    await Promise.all([
      queryClient.invalidateQueries(["users"]),
      queryClient.invalidateQueries(["leaves"]),
      fetchAttendance() 
    ]);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleTimeChange = (sessionId, timeValue) => {
    setCustomTimes(prev => ({
      ...prev,
      [sessionId]: timeValue
    }));
  };

  const employees = users.filter((u) => u.role !== "admin");
  const employeeIds = new Set(employees.map((u) => u._id));
  const validAttendance = attendance?.filter((a) => employeeIds.has(a.userId)) || [];
  
  const totalEmployees = employees.length;
  const todayDate = new Date().toISOString().split("T")[0];
  const todayCheckins = validAttendance.filter((a) => a.date === todayDate).length;
  const totalRecords = validAttendance.length;

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowISO = tomorrowDate.toISOString().split("T")[0];

  const tomorrowAwayUsers = employees.filter((u) => 
    leaves.some((l) => 
      l.userId?._id === u._id && 
      l.status === "approved" &&
      l.fromDate.slice(0, 10) <= tomorrowISO && 
      l.toDate.slice(0, 10) >= tomorrowISO
    )
  );

  const ghostSessions = (attendance || []).filter(a => a.date < todayDate && !a.checkout && !a.checkOut);
  const defaultCheckout = import.meta.env.VITE_DEFAULT_CHECKOUT_TIME || "18:00";

  const formatTime = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(new Date().getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const grouped = {};
  validAttendance.forEach((a) => {
    if (!grouped[a.date]) grouped[a.date] = 0;
    grouped[a.date]++;
  });

  const chartData = last7Days.map((date) => ({
    date,
    count: grouped[date] || 0
  }));

  const checkedInUserIds = new Set(
    validAttendance.filter((a) => a.date === todayDate).map((a) => a.userId)
  );

  const onLeaveUserIds = new Set(
    leaves
      .filter((l) => 
        l.status === "approved" &&
        l.fromDate.slice(0, 10) <= todayDate &&
        l.toDate.slice(0, 10) >= todayDate
      )
      .map((l) => l.userId?._id)
  );

  const checkedInUsers = employees.filter((u) => checkedInUserIds.has(u._id));
  const onLeaveUsers = employees.filter((u) => onLeaveUserIds.has(u._id));
  const absentUsers = employees.filter(
    (u) => !checkedInUserIds.has(u._id) && !onLeaveUserIds.has(u._id)
  );

  // --- PUNCTUALITY SETUP ---
  const todayDateObj = new Date();
  const firstDayOfMonth = new Date(todayDateObj.getFullYear(), todayDateObj.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = todayDateObj.toISOString().split('T')[0];
  
  const [puncFilters, setPuncFilters] = useState({
    startDate: firstDayOfMonth,
    endDate: lastDayOfMonth,
    department: 'All'
  });

  const { data: punctualityData, isLoading: isPuncLoading } = usePunctualityAnalytics(puncFilters);
  // console.log("Fetched punctuality data:", punctualityData);
  // Dynamically extract unique departments from the users array
  const uniqueDepartments = useMemo(() => {
    const depts = new Set(users.map(u => u.department).filter(Boolean)); // filter(Boolean) removes null/undefined
    return Array.from(depts).sort();
  }, [users]);

  // Handler to enforce a maximum 31-day span between dates
  const handlePuncDateChange = (type, value) => {
    const newDate = new Date(value);
    let newStart = new Date(puncFilters.startDate);
    let newEnd = new Date(puncFilters.endDate);

    if (type === 'start') {
      newStart = newDate;
      if (newStart > newEnd) newEnd = newStart; 
    } else {
      newEnd = newDate;
      if (newEnd < newStart) newStart = newEnd; 
    }

    // Enforce 31 days max
    const diffTime = Math.abs(newEnd - newStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 31) {
      if (type === 'start') {
        newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + 31);
      } else {
        newStart = new Date(newEnd);
        newStart.setDate(newStart.getDate() - 31);
      }
    }

    setPuncFilters({
      ...puncFilters,
      startDate: newStart.toISOString().split('T')[0],
      endDate: newEnd.toISOString().split('T')[0]
    });
  };

  // --- HELPER FUNCTION: Calculate Working Days ---
const getWorkingDaysCount = (startStr, endStr) => {
  let count = 0;
  // Append T00:00:00 to prevent local timezone shifts
  let current = new Date(`${startStr}T00:00:00`);
  const end = new Date(`${endStr}T00:00:00`);
  
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++; // Skip Sunday and Saturday
    current.setDate(current.getDate() + 1);
  }
  return count;
};

  
  return (
    <DashboardLayout>
      <div className="p-10 max-w-400 mx-auto space-y-10 bg-slate-50/30 min-h-screen">
        {isLoading ? (
          <AdminDashboardSkeleton />
        ) : (
          <>
        {/* HEADER */}
        <div className="border-b border-slate-200 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Administrative Overview</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Real-time monitoring of workforce operations and leave metrics.
            </p>
          </div>  
          <button 
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm shadow-indigo-200 shrink-0"
          >
            <Megaphone className="w-4 h-4" />
            New Broadcast
          </button>
        </div>

        {/* --- PAYROLL SMART TRIGGER BANNER --- */}
        <SmartTriggerBanner />

        <DataIntegrityAlert 
          ghostSessions={ghostSessions}
          users={users}
          handleRefresh={handleRefresh}
          customTimes={customTimes}
          defaultCheckout={defaultCheckout}
          handleTimeChange={handleTimeChange}
          formatTime={formatTime}
        />

        {/* Announcement FEED */}
        <div className="mb-8">
          <AnnouncementFeed />
        </div>

        {/* TOP LEVEL STATS */}
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Workforce</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-800">{totalEmployees}</h2>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-1" /> Active Employees
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today's Presence</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-800">{todayCheckins}</h2>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 font-medium">Checked in for {todayDate}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Records</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-800">{totalRecords}</h2>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 font-medium">Aggregated attendance entries</p>
          </div>
        </div>

        {tomorrowAwayUsers.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-lg shadow-sm border border-indigo-50">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-indigo-900 tracking-tight">Tomorrow's Outlook</h3>
                <p className="text-xs text-indigo-700/80 font-medium mt-0.5">
                  Expect <strong>{tomorrowAwayUsers.length}</strong> planned absence(s) for tomorrow ({tomorrowISO}).
                </p>
              </div>
            </div>
            <div className="flex -space-x-2.5 overflow-hidden p-1">
              {tomorrowAwayUsers.slice(0, 5).map((u) => (
                <img
                  key={u._id}
                  title={`${u.name}`}
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-indigo-50 object-cover shadow-sm transition-transform hover:-translate-y-1 hover:z-10 relative cursor-pointer"
                  src={u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=e0e7ff&color=3730a3`}
                  alt={u.name}
                  draggable="false"
                />
              ))}
              {tomorrowAwayUsers.length > 5 && (
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-indigo-200 text-[10px] font-black text-indigo-800 ring-2 ring-indigo-50 shadow-sm z-0">
                  +{tomorrowAwayUsers.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAIN VISUALIZATION */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="h-90 w-full">
            <AttendanceChart data={chartData} />
          </div>
        </div>

        {/* WORKFORCE SEGMENTATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Daily Workforce Status</h2>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
            {isRefreshing ? "Updating..." : "Refresh Data"}
          </button>

          <div className="grid grid-cols-3 gap-8">
            {/* COLUMN: CHECKED IN */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-125">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-700">Checked-in</h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">{checkedInUsers.length}</span>
              </div>
              <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
                {checkedInUsers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 italic text-xs">No active sessions</div>
                ) : (
                  checkedInUsers.map((u) => {
                    const record = validAttendance.find(a => a.userId === u._id && a.date === todayDate);
                    return (
                      <HoverItem
                        key={u._id}
                        user={u}
                        isCheckedout={!!record?.checkout}
                        content={
                          <div className="text-[11px] space-y-1">
                            <p className="font-bold border-b border-slate-100 pb-1 mb-1">Session Data</p>
                            <p><span className="text-slate-400">In:</span> {formatTime(record?.checkIn)}</p>
                            <p><span className="text-slate-400">Out:</span> {formatTime(record?.checkOut || record?.checkout)}</p>
                          </div>
                        }
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* COLUMN: ON LEAVE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-125">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-700">On Leave</h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">{onLeaveUsers.length}</span>
              </div>
              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                {onLeaveUsers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 italic text-xs">Full attendance</div>
                ) : (
                  onLeaveUsers.map((u) => {
                    const leave = leaves.find(l => l.userId?._id === u._id && l.status === "approved" && l.fromDate.slice(0, 10) <= todayDate && l.toDate.slice(0, 10) >= todayDate);
                    return (
                      <HoverItem
                        key={u._id}
                        user={u}
                        toDate={leave?.toDate.slice(0, 10)}
                        content={
                          <div className="text-[11px] space-y-1">
                            <p className="font-bold border-b border-slate-100 pb-1 mb-1">Leave Info</p>
                            <p className="italic">"{leave?.reason || 'No reason provided'}"</p>
                            <p><span className="text-slate-400">Returning:</span> {leave?.toDate.slice(0, 10)}</p>
                          </div>
                        }
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* COLUMN: ABSENT */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-125">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-rose-700">Absent</h3>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full">{absentUsers.length}</span>
              </div>
              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                {absentUsers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 italic text-xs">Zero absences</div>
                ) : (
                  absentUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f1f5f9&color=475569`}
                          className="w-9 h-9 rounded-full object-cover grayscale"
                          alt={u.name}
                          draggable="false"
                        />
                        <p className="text-sm font-bold text-slate-700">{u.name}</p>
                      </div>
                      <button
                        onClick={() => {
                          setEmailUser(u);
                          setEmailTemplate({
                            subject: "Attendance Reminder",
                            message: `Hi ${u.name}, our records show you haven't checked in for today (${todayDate}). Please update your status.`
                          });
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Send Notification"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ANALYTICS SECTION */}
        <div className="pt-6 border-t border-slate-200">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leave Intelligence</h2>
            <p className="text-slate-500 text-sm font-medium">Patterns and distribution of time-off requests.</p>
          </div>

          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-100">
              <LeaveStatusChart leaves={recentLeaves} />
            </div>
            <div className="col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-100">
              <LeaveTrendChart leaves={leaves} />
            </div>
          </div>
        </div>


        {/* --- PUNCTUALITY & COMPLIANCE SECTION --- */}
        <div className="pt-8 mt-8 border-t border-slate-200 mb-10">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Workforce Punctuality</h2>
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">
                  {getWorkingDaysCount(puncFilters.startDate, puncFilters.endDate)} Working Days
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium mt-1">Shift compliance and arrival trends for the selected period.</p>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                <input 
                  type="date" 
                  value={puncFilters.startDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handlePuncDateChange('start', e.target.value)}
                  className="text-xs font-bold text-slate-600 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                />
                <span className="text-slate-300">-</span>
                <input 
                  type="date" 
                  value={puncFilters.endDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handlePuncDateChange('end', e.target.value)}
                  className="text-xs font-bold text-slate-600 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                />
              </div>
              
              <select
                value={puncFilters.department}
                onChange={(e) => setPuncFilters({ ...puncFilters, department: e.target.value })}
                className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 shadow-sm min-w-35 cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
              >
                <option value="All">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {isPuncLoading || !punctualityData ? (
            <div className="h-100 flex items-center justify-center border border-slate-200 bg-white rounded-2xl text-slate-400 text-sm font-bold animate-pulse shadow-sm">
              Crunching Time Analytics...
            </div>
          ) : (
            <>
              {/* KPI & Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KPI Column */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-center h-full hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">On-Time Rate</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-black text-slate-800">{punctualityData.summary.onTimeRate}%</h3>
                      <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600"><TrendingUp className="w-5 h-5" /></div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-center h-full hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Arrival</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-black text-slate-800">{punctualityData.summary.averageArrivalTime} <span className="text-lg text-slate-400 font-bold">AM</span></h3>
                      <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600"><Clock className="w-5 h-5" /></div>
                    </div>
                  </div>

                  <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl shadow-sm flex flex-col justify-center h-full hover:border-rose-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Total Time Lost</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-black text-rose-700">{Math.round(punctualityData.summary.cumulativeMinutesLost / 60)} <span className="text-lg text-rose-400 font-bold">Hrs</span></h3>
                      <div className="bg-rose-100 p-2.5 rounded-xl text-rose-600 shadow-sm"><AlertTriangle className="w-5 h-5" /></div>
                    </div>
                  </div>
                </div>

                {/* Chart Column */}
                <div className="col-span-1 lg:col-span-2 h-100">
                  <PunctualityChart data={punctualityData.chartData} />
                </div>
              </div>

              {/* ACTIONABLE INCIDENTS TABLE */}
              <div className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Top 5 Actionable Incidents</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Employees with the highest amount of time lost during the selected dates.</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-white text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4 text-center">Late Days</th>
                        <th className="px-6 py-4 text-center">Severe ({'>'}1hr)</th>
                        <th className="px-6 py-4 text-right">Total Time Lost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {punctualityData.offendersList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center">
                             <div className="flex flex-col items-center justify-center">
                               <div className="bg-emerald-50 p-3 rounded-full mb-3">
                                 <TrendingUp className="w-6 h-6 text-emerald-500" />
                               </div>
                               <p className="text-slate-500 font-bold text-sm">Excellent Punctuality!</p>
                               <p className="text-slate-400 text-xs mt-1">No late arrivals recorded for this period.</p>
                             </div>
                          </td>
                        </tr>
                      ) : (
                        // Sort by total time lost (descending) and take only the top 5
                        [...punctualityData.offendersList]
                          .sort((a, b) => b.totalMinutesLate - a.totalMinutesLate)
                          .slice(0, 5)
                          .map((offender) => (
                            <tr key={offender.userId} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(offender.name)}&background=f8fafc&color=475569`} 
                                    className="w-9 h-9 rounded-full border border-slate-200" 
                                    alt={offender.name} 
                                  />
                                  <span className="font-bold text-slate-700">{offender.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-500">{offender.department || '—'}</td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center bg-amber-50 border border-amber-100 text-amber-600 w-8 h-8 rounded-lg font-bold shadow-sm">
                                  {offender.lateCount}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {offender.severeCount > 0 ? (
                                  <span className="inline-flex items-center justify-center bg-rose-50 border border-rose-100 text-rose-600 w-8 h-8 rounded-lg font-bold shadow-sm">
                                    {offender.severeCount}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 font-bold">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-black text-rose-600">{offender.totalMinutesLate}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">mins</span>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

      </>)}
      
        <EmailModal
          isOpen={!!emailUser}
          onClose={() => {
            setEmailUser(null);
            setEmailTemplate(null);
          }}
          user={emailUser}
          template={emailTemplate}
        />

        <CreateAnnouncementModal 
          isOpen={isAnnouncementModalOpen} 
          onClose={() => setIsAnnouncementModalOpen(false)} 
        />
      
      </div>
    </DashboardLayout>
  );
}
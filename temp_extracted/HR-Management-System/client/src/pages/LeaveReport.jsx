import DashboardLayout from "../layouts/DashboardLayout";
import LeaveReportsSkeleton from "../components/LeaveReportsSkeleton";
import { useAllLeaves } from "../hooks/useLeaves";
import { useUsers } from "../hooks/useUsers";
import { useState, useMemo, useEffect } from "react";
import LeaveDetailsModal from "../components/LeaveDetailsModal";
import { useTitle } from "../hooks/useTitle";
import { 
  Search, 
  Filter, 
  Calendar, 
  User as UserIcon, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  FileText,
} from "lucide-react";

export default function LeaveReports() {
  useTitle("Leaves")
  const { data: leaves = [], isLoading } = useAllLeaves();
  const { data: users = [] } = useUsers();

  const filteredUsers = users?.filter((u) => u.role == "employee");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("all");
  const [employee, setEmployee] = useState("all");

  const [selectedLeave, setSelectedLeave] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const LEAVES_PER_PAGE = 8;

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const name = leave.userId?.name?.toLowerCase() || "";
      const email = leave.userId?.email?.toLowerCase() || "";
      const type = leave.type?.toLowerCase() || "";

      const searchMatch =
        name.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase()) ||
        type.includes(search.toLowerCase())

      const statusMatch = status === "all" || leave.status === status;
      const employeeMatch = employee === "all" || leave.userId?._id === employee;
      const leaveMonth = new Date(leave.fromDate).getMonth();
      const monthMatch = month === "all" || leaveMonth === parseInt(month);

      return searchMatch && statusMatch && employeeMatch && monthMatch;
    });
  }, [leaves, search, status, month, employee]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, month, employee]);

  const totalPages = Math.ceil(filteredLeaves.length / LEAVES_PER_PAGE);

  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * LEAVES_PER_PAGE;
    return filteredLeaves.slice(start, start + LEAVES_PER_PAGE);
  }, [filteredLeaves, currentPage]);

  const handleReset = () => {
    setSearch("");
    setMonth("all");
    setStatus("all");
    setEmployee("all");
    setCurrentPage(1);
  };

  const getStatusStyle = (status) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === "rejected") return "bg-rose-50 text-rose-700 border-rose-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <DashboardLayout>
      <div className="p-10 max-w-350 mx-auto space-y-8 bg-slate-50/30 min-h-screen">

        {isLoading ? (
            <LeaveReportsSkeleton />
          ) : (
            <>
        {/* HEADER */}
        <header className="flex items-end justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Reports</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Comprehensive analysis and history of employee leave records.
            </p>
          </div>
          <div className="text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
            {filteredLeaves.length} Records Found
          </div>
        </header>

        {/* FILTERS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Filter className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-widest">Advanced Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative group md:col-span-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm appearance-none bg-white cursor-pointer focus:border-indigo-500 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm appearance-none bg-white cursor-pointer focus:border-indigo-500 outline-none"
              >
                <option value="all">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <select
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm appearance-none bg-white cursor-pointer focus:border-indigo-500 outline-none"
              >
                <option value="all">All Employees</option>
                {filteredUsers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleReset} 
              className="flex items-center justify-center gap-2 h-10 border border-rose-200 bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Leave Type</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    Loading records...
                  </td>
                </tr>
              ) : paginatedLeaves.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <FileText className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium italic">No leave records found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedLeaves.map((leave) => (
                  <tr
                    key={leave._id}
                    onClick={() => setSelectedLeave(leave)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={leave.userId?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.userId?.name)}&background=f1f5f9&color=475569`}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm transition-transform group-hover:scale-105"
                          alt="Avatar"
                          draggable="false"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 tracking-tight">{leave.userId?.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{leave.userId?.email}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <span className="font-semibold text-slate-700 capitalize">{leave.type}</span>
                    </td>

                    <td className="px-6 py-5 text-slate-600 font-medium tabular-nums">
                      {leave.fromDate.slice(0, 10)} 
                      <span className="mx-2 text-slate-300">→</span> 
                      {leave.toDate.slice(0, 10)}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        </>)}

        {/* DETAILS MODAL */}
        <LeaveDetailsModal
          leave={selectedLeave}
          onClose={() => setSelectedLeave(null)}
        />
      </div>
    </DashboardLayout>
  );
}
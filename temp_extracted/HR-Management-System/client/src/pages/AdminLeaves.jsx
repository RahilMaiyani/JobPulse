import DashboardLayout from "../layouts/DashboardLayout";
import { useActiveLeaves, useUpdateLeave } from "../hooks/useLeaves";
import { useState, useMemo, useEffect } from "react";
import DecisionModal from "../components/DecisionModal";
import LeaveDetailsModal from "../components/LeaveDetailsModal";
import { useTitle } from "../hooks/useTitle";
import AdminLeavesSkeleton from "../components/AdminLeavesSkeleton";
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  CalendarDays,
  Wallet
} from "lucide-react";

export default function AdminLeaves() {
  useTitle("Leave Management");
  const { data = [], isLoading } = useActiveLeaves();
  const update = useUpdateLeave();

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [decision, setDecision] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const LEAVES_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / LEAVES_PER_PAGE);

  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * LEAVES_PER_PAGE;
    return data.slice(start, start + LEAVES_PER_PAGE);
  }, [data, currentPage]);

  const getStatusStyle = (status) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === "rejected") return "bg-rose-50 text-rose-700 border-rose-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <DashboardLayout>
      <div className="p-10 max-w-350 mx-auto space-y-8 bg-slate-50/30 min-h-screen">
      {isLoading ? (
          <AdminLeavesSkeleton />
        ) : (
          <>

        {/* HEADER */}
        <header className="flex items-end justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Requests</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Review, approve, or decline employee time-off applications.
            </p>
          </div>
          <div className="text-right">
             <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                {data.filter(l => l.status === 'pending').length} Pending Requests
             </span>
          </div>
        </header>

        {/* DATA TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type & Balance</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Review</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                       Loading requests...
                    </div>
                  </td>
                </tr>
              ) : paginatedLeaves.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium italic">No active leave requests found.</p>
                  </td>
                </tr>
              ) : (
                paginatedLeaves.map((leave) => {
                  const balance = leave.userId?.leaveBalance?.[leave.type];
                  
                  return (
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
                          alt="Employee"
                          draggable="false"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 tracking-tight">{leave.userId?.name}</span>
                          <span className="text-xs text-slate-500">{leave.userId?.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-700 capitalize flex items-center gap-2">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          {leave.type}
                        </span>
                        {leave.type !== "unpaid" && balance !== undefined && (
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <Wallet className="w-3 h-3 text-emerald-500" />
                            Bal: {balance} Days
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-slate-600 font-medium tabular-nums">
                      {leave.fromDate.slice(0, 10)} 
                      <span className="mx-2 text-slate-300">→</span> 
                      {leave.toDate.slice(0, 10)}
                    </td>

                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    
                    <td
                      className="px-6 py-5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {leave.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setDecision({ id: leave._id, type: "approved" })}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Approve Request"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => setDecision({ id: leave._id, type: "rejected" })}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Reject Request"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-right pr-4 italic text-slate-400 text-xs font-medium">Processed</div>
                      )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Viewing Page {currentPage} of {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        </>)}

        {/* MODALS */}
        <DecisionModal
          isOpen={!!decision}
          type={decision?.type}
          onClose={() => setDecision(null)}
          isProcessing={update.isPending || update.isLoading} // <-- NEW: Check if API is loading
          onSubmit={(comment) => {
            update.mutate({
              id: decision.id,
              status: decision.type,
              adminComment: comment
            }, {
              // <-- NEW: Only close the modal on success, so it waits for UI to update
              onSuccess: () => {
                setDecision(null);
              }
            });
          }}
        />

        <LeaveDetailsModal
          leave={selectedLeave}
          onClose={() => setSelectedLeave(null)}
        />

      </div>
    </DashboardLayout>
  );
}
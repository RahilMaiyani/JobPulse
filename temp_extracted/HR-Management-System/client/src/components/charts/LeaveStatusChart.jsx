import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { PieChart } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function LeaveStatusChart({ leaves = [] }) {
  const counts = {
    approved: 0,
    pending: 0,
    rejected: 0
  };

  leaves.forEach((leave) => {
    if (counts[leave.status] !== undefined) {
      counts[leave.status] += 1;
    }
  });

  const chartData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        data: [counts.approved, counts.pending, counts.rejected],
        backgroundColor: [
          "#10b981", 
          "#f59e0b", 
          "#f43f5e"
        ],
        hoverBackgroundColor: [
          "#059669", 
          "#d97706", 
          "#e11d48"
        ],
        borderWidth: 4,
        borderColor: "#ffffff",
        hoverOffset: 12
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%", 
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 11,
            weight: "600",
            family: "'Inter', sans-serif"
          },
          color: "#64748b"
        }
      },
      tooltip: {
        backgroundColor: "#1e293b", 
        padding: 12,
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-x h-90 flex flex-col transition-all">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <PieChart className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
            Distribution
          </h2>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-2 py-1 rounded">
          Total: {leaves.length}
        </span>
      </div>

      {/* CHART AREA */}
      <div className="flex-1 min-h-0 relative">
        {leaves.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl space-y-2">
             <PieChart className="w-8 h-8 text-slate-200" />
             <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
               No Data Logged
             </p>
          </div>
        ) : (
          <>
            <Doughnut data={chartData} options={options} />
            {/* Center Label for desktop depth */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Requests</span>
              <span className="text-xl font-black text-slate-800 leading-none">{leaves.length}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
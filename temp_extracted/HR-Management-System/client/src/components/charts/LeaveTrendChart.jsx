import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TrendingUp, Calendar } from "lucide-react";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

function toDateKey(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function LeaveTrendChart({ leaves = [] }) {
  const approvedLeaves = leaves.filter((leave) => leave.status === "approved");

  const today = new Date();
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const grouped = {};

  approvedLeaves.forEach((leave) => {
    const key = toDateKey(leave.fromDate);
    if (!key) return;
    grouped[key] = (grouped[key] || 0) + 1;
  });

  const chartData = {
    labels: last7Days.map((date) =>
      new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short"
      })
    ),
    datasets: [
      {
        label: "Approved Requests",
        data: last7Days.map((date) => grouped[date] || 0),
        borderColor: "#4f46e5", // Indigo-600
        backgroundColor: "rgba(79, 70, 229, 0.05)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#4f46e5",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: "#94a3b8",
          font: { size: 11, weight: "500" }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#f1f5f9" 
        },
        ticks: {
          stepSize: 1,
          color: "#94a3b8",
          font: { size: 11 }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl h-90 flex flex-col transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Calendar className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
            Approval Velocity
          </h2>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-md border border-slate-100">
          <TrendingUp className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            Last 7 Days
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {approvedLeaves.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl space-y-2">
             <div className="p-2 bg-slate-50 rounded-full">
                <Calendar className="w-5 h-5 text-slate-200" />
             </div>
             <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
               No Approval Data
             </p>
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
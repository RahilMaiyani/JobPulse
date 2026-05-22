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
import { TrendingUp } from "lucide-react";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

export default function AttendanceChart({ data }) {
  const chartData = {
    labels: data.map((d) =>
      new Date(d.date).toLocaleDateString("en-US", {
        weekday: "short"
      })
    ),
    datasets: [
      {
        label: "Daily Check-ins",
        data: data.map((d) => d.count),
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
        display: false, 
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
          display: false,
        },
        ticks: {
          color: "#94a3b8", 
          font: { size: 11, weight: "500" }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#f1f5f9",
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
    <div className="bg-white p-6 rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Attendance Velocity
          </h2>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
          Last 7 Days
        </span>
      </div>

      <div className="flex-1 min-h-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
            <p className="text-slate-400 text-xs font-medium italic">
              Insufficient data for analysis
            </p>
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
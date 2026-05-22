import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Clock } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function PunctualityChart({ data = [] }) {
  const chartData = {
    labels: data.map((d) => {
      const date = new Date(d.date);
      return `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.getDate()}`;
    }),
    datasets: [
      {
        label: "Early",
        data: data.map((d) => d.early),
        backgroundColor: "#6ee7b7", // emerald-300 (Soft Teal)
        hoverBackgroundColor: "#34d399", // emerald-400
        borderRadius: 4,
        maxBarThickness: 40,
      },
      {
        label: "On Time",
        data: data.map((d) => d.onTime),
        backgroundColor: "#93c5fd", // blue-300 (Soft Blue)
        hoverBackgroundColor: "#60a5fa", // blue-400
        borderRadius: 4,
        maxBarThickness: 40,
      },
      {
        label: "Late",
        data: data.map((d) => d.late),
        backgroundColor: "#fcd34d", // amber-300 (Soft Yellow)
        hoverBackgroundColor: "#fbbf24", // amber-400
        borderRadius: 4,
        maxBarThickness: 40,
      },
      {
        label: "Severe (>1hr)",
        data: data.map((d) => d.severe),
        backgroundColor: "#fda4af", // rose-300 (Soft Pink/Red)
        hoverBackgroundColor: "#fb7185", // rose-400
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 11, weight: "600", family: "'Inter', sans-serif" },
          color: "#64748b",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11, weight: "500" } },
        border: { display: false }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: "#f8fafc", drawBorder: false },
        ticks: { stepSize: 1, color: "#cbd5e1", font: { size: 11 } },
        border: { display: false }
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <Clock className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
          Arrival Distribution
        </h2>
      </div>

      <div className="flex-1 min-h-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
            <p className="text-slate-400 text-xs font-medium italic">
              Insufficient data for analysis
            </p>
          </div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
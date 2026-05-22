import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from "../layouts/DashboardLayout";
import { useMyPayslips, useDownloadPayslip } from "../hooks/usePayroll";
import { useTitle } from "../hooks/useTitle";
import PayslipsSkeleton from '../components/PayslipSkeleton';
import { useAuth } from '../context/AuthContext';
import PayslipModal from '../components/PayslipPreviewModal';

import { 
  FileText, 
  IndianRupee, 
  Download, 
  Eye, 
  EyeOff,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export default function MyPayslips() {
  useTitle("Payslips");
  
  const { data: payslips = [], isLoading } = useMyPayslips();
  const downloadMutation = useDownloadPayslip();
  const { user } = useAuth();
  
  // State
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  
  // Privacy Toggle State (defaults to hidden)
  const [isAmountVisible, setIsAmountVisible] = useState(false);

  const ITEMS_PER_PAGE = 6;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const availableYears = useMemo(() => {
    if (!payslips) return [];
    return [...new Set(payslips.map(p => p.year))].sort((a, b) => b - a);
  }, [payslips]);

  const monthOptions = useMemo(() => {
    const uniqueMonths = new Set(payslips.map(p => {
      if(p.year.toString() === selectedYear || !selectedYear) {
        return p.month;
      }
    }));
    return months.filter(m => uniqueMonths.has(m));
  }, [payslips, selectedYear, months]);

  // Filtering Logic
  const filteredPayslips = useMemo(() => {
    return payslips.filter(p => {
      const matchMonth = selectedMonth ? p.month === selectedMonth : true;
      const matchYear = selectedYear ? p.year.toString() === selectedYear : true;
      return matchMonth && matchYear;
    });
  }, [payslips, selectedMonth, selectedYear]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPayslips.length / ITEMS_PER_PAGE);
  const paginatedPayslips = filteredPayslips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // TanStack Download Handler
  const handleDownload = (slip) => {
    downloadMutation.mutate(slip._id, {
      onSuccess: (blobData) => {
        const url = window.URL.createObjectURL(new Blob([blobData]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${user.name} Payslip ${slip.month} ${slip.year}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      },
      onError: (error) => {
        console.error("Download failed", error);
        alert("Failed to download PDF. Please try again.");
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Financials</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">View and download your official corporate salary statements.</p>
          </div>

          {/* Action Bar (Filters + Privacy Toggle) */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsAmountVisible(!isAmountVisible)}
              className={`flex items-center justify-center gap-2 h-11 px-4 border rounded-lg text-sm font-bold transition-all shadow-sm ${
                isAmountVisible 
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isAmountVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{isAmountVisible ? "Hide" : "Show"} Amount</span>
            </button>

            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-9 pr-8 h-11 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white shadow-sm cursor-pointer w-36"
              >
                <option value="">All Months</option>
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="relative group">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 pr-8 h-11 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white shadow-sm cursor-pointer w-28"
              >
                <option value="">All Years</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <button 
              onClick={() => { setSelectedMonth(""); setSelectedYear(""); }} 
              className="flex items-center justify-center gap-2 h-11 px-4 border border-rose-200 bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <PayslipsSkeleton />
        ) : filteredPayslips.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <IndianRupee className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Financial Records</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              No payslips found for the selected criteria. Salary statements appear here once processed by HR.
            </p>
          </div>
        ) : (
          <>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedPayslips.map((slip) => (
                <div key={slip._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pay Period</p>
                      <h3 className="text-lg font-bold text-slate-800">{slip.month} {slip.year}</h3>
                    </div>
                    <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-8 flex-1">
                    <p className="text-sm text-slate-600 flex items-center">
                      <span className="font-medium text-slate-500 w-24 inline-block">Net Pay:</span> 
                      <span className="font-bold text-slate-800">
                        {isAmountVisible ? `₹${slip.netPay.toLocaleString('en-IN')}` : '₹--,---'}
                      </span>
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-500 w-24 inline-block">Generated:</span> 
                      {new Date(slip.createdAt || Date.now()).toLocaleDateString('en-GB')}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-500 w-24 inline-block">Status:</span> 
                      <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded">Processed</span>
                    </p>
                  </div>

                  {/* Action Buttons matching Vault UI */}
                  <div className="flex gap-3 mt-auto border-t border-slate-100 pt-5">
                    <button 
                      onClick={() => setSelectedPayslip(slip)}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button 
                      onClick={() => handleDownload(slip)}
                      disabled={downloadMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm shadow-indigo-200"
                    >
                      {downloadMutation.isPending && downloadMutation.variables === slip._id ? (
                        "Processing..."
                      ) : (
                        <><Download className="w-4 h-4" /> Download</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-8 px-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 2. Call your separated component */}
        <PayslipModal 
          isOpen={!!selectedPayslip} 
          onClose={() => setSelectedPayslip(null)} 
          payslip={selectedPayslip} 
        />

      </div>
    </DashboardLayout>
  );
}
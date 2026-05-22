import React, { useState } from 'react';
import { usePayrollStatus, useGeneratePayroll } from "../hooks/usePayroll";
import { Banknote, RefreshCw } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";

const SmartTriggerBanner = () => {
  const { data: status, isLoading, isError } = usePayrollStatus();
  const generateMutation = useGeneratePayroll();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (isLoading || isError || !status?.actionRequired) return null;

  return (
    <>
      <div className="bg-indigo-50 border-indigo-200 border p-5 rounded-2xl shadow-sm mb-6 transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            
            {/* Soft Tinted Icon Box */}
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
              {generateMutation.isPending ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Banknote className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
                  Action Required: {status.targetMonth} {status.targetYear} Payroll
                </h3>
                {/* Broadcast-style Badge */}
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
                  Finance
                </span>
              </div>
              
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                The automated engine is ready to process salaries and generate secure payslips.
              </p>
              
              {generateMutation.isError && (
                <p className="text-xs text-rose-600 font-bold mt-1.5">
                  Error: {generateMutation.error?.response?.data?.msg || 'Execution failed.'}
                </p>
              )}
            </div>
          </div>
          
          <div className="shrink-0">
            <button 
              onClick={() => setIsConfirmOpen(true)}
              disabled={generateMutation.isPending || generateMutation.isSuccess}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
            >
              {generateMutation.isPending ? "Processing..." : "Run Payroll"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          generateMutation.mutate();
          setIsConfirmOpen(false);
        }}
        title="Execute Monthly Payroll"
        message={`Are you sure you want to run payroll for ${status.targetMonth} ${status.targetYear}? Secure PDFs will be generated and emailed to all configured employees.`}
      />
    </>
  );
};

export default SmartTriggerBanner;
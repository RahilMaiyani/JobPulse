import React from 'react';
import Modal from "./ui/Modal";
import { FileText, ShieldCheck, ArrowDownToLine } from 'lucide-react';

export default function PayslipModal({ isOpen, onClose, payslip }) {
  // Prevent rendering errors if it's open but data hasn't loaded yet
  if (!payslip) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        {/* Header */}
        <div className="mb-6 border-b border-slate-100 pb-6 text-center">
          <div className="mx-auto bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center text-indigo-600 mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {payslip.month} {payslip.year} Statement
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Financial Record
          </p>
        </div>

        {/* Body */}
        <div className="space-y-6">
          {/* Earnings */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Earnings</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Basic Pay</span>
                <span className="text-slate-800 font-bold">₹{payslip.earnings.basicPay.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Special Allowance</span>
                <span className="text-slate-800 font-bold">₹{payslip.earnings.specialAllowance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Deductions</p>
            <div className="space-y-2">
              {payslip.deductions.lossOfPay > 0 && (
                <div className="flex justify-between text-sm text-rose-600">
                  <span className="font-medium">Loss of Pay (Leaves)</span>
                  <span className="font-bold">- ₹{payslip.deductions.lossOfPay.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-rose-600">
                <span className="font-medium">Professional Tax</span>
                <span className="font-bold">- ₹{payslip.deductions.professionalTax.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Total */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-widest">Total Net Pay</span>
            <span className="text-xl font-black text-indigo-700">₹{payslip.netPay.toLocaleString('en-IN')}</span>
          </div>
          
          {/* Info Banner */}
          <div className="bg-slate-50 p-3 rounded-lg flex gap-2 items-start text-slate-500">
            <ArrowDownToLine className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[10px] font-medium leading-relaxed">
              A secure PDF copy was also emailed to you. Use the download button to pull a fresh copy directly from the vault.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
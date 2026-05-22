import React, { useState, useEffect } from "react";
import Modal from "./ui/Modal"; // Adjust path if your Modal is in a different folder
import { Banknote, ShieldCheck, IndianRupee, Landmark } from "lucide-react";
import { useSetupSalary } from "../hooks/usePayroll"; 

export default function PayrollSetupModal({ isOpen, onClose, user }) {
  const [basicPay, setBasicPay] = useState("");
  const [specialAllowance, setSpecialAllowance] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const setupMutation = useSetupSalary();

  // Populate existing data when modal opens
  useEffect(() => {
    if (user && isOpen) {
      setBasicPay(user.salaryDetails?.basicPay || "");
      setSpecialAllowance(user.salaryDetails?.specialAllowance || "");
      setBankName(user.bankDetails?.bankName || "");
      setIfscCode(user.bankDetails?.ifscCode || "");
      setAccountNumber(""); // ALWAYS empty for security
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setupMutation.mutate(
      {
        id: user._id,
        payload: {
          basicPay: Number(basicPay),
          specialAllowance: Number(specialAllowance),
          bankName,
          ifscCode,
          accountNumber: accountNumber.trim() !== "" ? accountNumber : undefined, // Only send if they typed a new one
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Banknote className="w-5 h-5 text-indigo-600" />
          Payroll Configuration
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Set compensation and direct deposit for <span className="text-indigo-600 font-bold">{user.name}</span>.
        </p>
      </div>

      {/* <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex gap-3 items-start">
        <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
          Security: The bank account number is immediately encrypted via AES-256 upon saving. It cannot be read by administrators afterward.
        </p>
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* --- Compensation Section --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 pb-2 border-b border-slate-100">
            <IndianRupee className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Compensation</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Basic Pay
              </label>
              <input
                type="number"
                required
                value={basicPay}
                onChange={(e) => setBasicPay(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                placeholder="e.g. 45000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Special Allowance
              </label>
              <input
                type="number"
                required
                value={specialAllowance}
                onChange={(e) => setSpecialAllowance(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                placeholder="e.g. 15000"
              />
            </div>
          </div>
        </div>

        {/* --- Bank Details Section --- */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-emerald-700 pb-2 border-b border-slate-100">
            <Landmark className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Direct Deposit</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                placeholder="e.g. HDFC Bank"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                IFSC Code
              </label>
              <input
                type="text"
                required
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all uppercase"
                placeholder="e.g. HDFC0001234"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-mono placeholder:font-sans"
              placeholder={user.bankDetails?.bankName ? "•••• •••• Hidden (Leave blank to keep)" : "Enter account number"}
            />
          </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex gap-3 pt-6 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Discard
          </button>
          <button 
            type="submit"
            disabled={setupMutation.isPending}
            className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {setupMutation.isPending ? "Encrypting..." : "Save Config"}
          </button>
        </div>

      </form>
    </Modal>
  );
}
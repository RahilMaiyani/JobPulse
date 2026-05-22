import { useForm } from "react-hook-form";
import { useState, useMemo } from "react";
import Modal from "./ui/Modal";
import { useApplyLeave } from "../hooks/useLeaves";
import { Calendar, AlertCircle } from "lucide-react";

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return new Date(y, m - 1, d); 
}

function isWeekend(dateStr) {
  const date = parseDate(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
}

function rangeHasWeekend(fromDate, toDate) {
  let current = parseDate(fromDate);
  const end = parseDate(toDate);

  while (current <= end) {
    const day = current.getDay();
    if (day === 0 || day === 6) return true;
    current.setDate(current.getDate() + 1);
  }

  return false;
}

// Passed 'user' as a prop to access the leaveBalance object
export default function LeaveModal({ isOpen, onClose, user }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm({
    defaultValues: {
      type: "sick",
      fromDate: "",
      toDate: "",
      reason: ""
    }
  });

  const [apiError, setApiError] = useState("");
  const mutation = useApplyLeave();

  const type = watch("type");
  const fromDate = watch("fromDate");
  const toDate = watch("toDate");

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const max = new Date();
  max.setDate(today.getDate() + 14);
  const maxDate = max.toISOString().split("T")[0];

  // --- BALANCE CALCULATIONS ---
  const requestedDays = useMemo(() => {
    if (!fromDate || !toDate || fromDate > toDate || rangeHasWeekend(fromDate, toDate)) return 0;
    const start = parseDate(fromDate);
    const end = parseDate(toDate);
    return Math.round(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, [fromDate, toDate]);

  // Fallback to 0 if the user data hasn't loaded or doesn't have the balance object
  const availableBalance = user?.leaveBalance?.[type] || 0;
  const isOutOfBalance = type !== "unpaid" && requestedDays > availableBalance;

  const validateDate = (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    if (value < minDate) return "Future dates only";
    if (value > maxDate) return "Max 2 weeks window";
    if (isWeekend(value)) return "Weekends restricted";
    return true;
  };

  const onSubmit = (data) => {
    setApiError("");
    clearErrors("toDate");

    if (data.fromDate > data.toDate) {
      setError("toDate", {
        type: "manual",
        message: "Check-out date must follow check-in"
      });
      return;
    }

    if (rangeHasWeekend(data.fromDate, data.toDate)) {
      setError("toDate", {
        type: "manual",
        message: "Range includes weekend days"
      });
      return;
    }

    // Failsafe check
    if (type !== "unpaid" && requestedDays > availableBalance) {
      setApiError(`Insufficient ${type} balance.`);
      return;
    }

    mutation.mutate(data, {
      onSuccess: () => {
        reset();
        onClose(); 
      },
      onError: (err) => {
        setApiError(err?.response?.data?.msg || "Failed to process request");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Request Leave
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Submit your absence request for approval.
        </p>
      </div>

      <div className="mb-6 p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-3 items-start">
        <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          Policy: Leave can only be applied for future weekdays within a 14-day window. Weekend dates are automatically restricted.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Category
          </label>
          <select
            {...register("type", { required: "Required" })}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-indigo-500 outline-none transition-all"
          >
            <option value="sick">Sick Leave</option>
            <option value="casual">Casual Leave</option>
            <option value="earned">Earned Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Start Date
            </label>
            <input
              type="date"
              min={minDate}
              max={maxDate}
              {...register("fromDate", {
                validate: (v) => validateDate(v, "From date")
              })}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
            />
            {errors.fromDate && (
              <p className="text-rose-500 text-[10px] font-bold uppercase mt-1 ml-1 tracking-tighter">
                {errors.fromDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              End Date
            </label>
            <input
              type="date"
              min={fromDate || minDate}
              max={maxDate}
              {...register("toDate", {
                validate: (v) => validateDate(v, "To date")
              })}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
            />
            {errors.toDate && (
              <p className="text-rose-500 text-[10px] font-bold uppercase mt-1 ml-1 tracking-tighter">
                {errors.toDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Reason for Absence
          </label>
          <textarea
            rows="3"
            placeholder="Briefly describe the reason for your leave request..."
            {...register("reason", {
              required: "Reason required",
              minLength: { value: 5, message: "Provide more detail" }
            })}
            className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all resize-none"
          />
          {errors.reason && (
            <p className="text-rose-500 text-[10px] font-bold uppercase mt-1 ml-1 tracking-tighter">
              {errors.reason.message}
            </p>
          )}
        </div>

        {/* --- LIVE BALANCE TRACKER --- */}
        {fromDate && toDate && requestedDays > 0 && (
          <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${isOutOfBalance ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Requested</p>
              <p className="text-sm font-black">{requestedDays} Day{requestedDays > 1 ? 's' : ''}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Available</p>
              <p className="text-sm font-black">{type === "unpaid" ? "Unlimited" : availableBalance}</p>
            </div>
          </div>
        )}

        {(apiError || isOutOfBalance) && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[11px] font-bold text-center">
            {isOutOfBalance ? "Insufficient balance for this request." : apiError}
          </div>
        )}

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
            disabled={mutation.isPending || isOutOfBalance || requestedDays === 0}
            className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Processing..." : "Submit Request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
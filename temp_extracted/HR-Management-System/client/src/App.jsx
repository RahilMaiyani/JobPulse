import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, Suspense } from "react";
import { Toaster } from 'react-hot-toast';
import { WifiOff } from "lucide-react";

import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Employee from "./pages/Employee";
import Users from "./pages/Users";
import MyLeaves from "./pages/MyLeaves";
import AdminLeaves from "./pages/AdminLeaves";
import LeaveReports from "./pages/LeaveReport";
import AttendanceHistory from "./pages/AttendanceHistory";
import DocumentVault from "./pages/DocumentVault";
import AdminDocuments from "./pages/AdminDocuments";
import EmployeeHelpdesk from "./pages/EmployeeHelpdesk";
import EmployeeFinancials from "./pages/MyPayslips";
import AdminHelpdesk from "./pages/AdminHelpdesk";

import ProtectedRoute from "./routes/ProtectedRoute";
import PageLoader from "./components/PageLoader";
import NotFound from "./NotFound";

function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-6 right-6 z-9999 animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-slate-900 border border-slate-700 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 bg-rose-500/20 rounded-xl">
          <WifiOff className="w-5 h-5 text-rose-500 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">Network Connection Lost</p>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
            Offline Mode Active
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      {/* PROFESSIONAL TOAST CONFIG */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b", // Slate-800
            color: "#fff",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            padding: "12px 20px",
            border: "1px solid rgba(255,255,255,0.1)"
          },
          success: {
            iconTheme: { primary: "#6366f1", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          }
        }}
      />

      {/* GLOBAL OFFLINE INDICATOR */}
      <OfflineBanner />

      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Login />} />

            {/* ADMIN ROUTES */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute role="admin"><Users /></ProtectedRoute>} />
            <Route path="/admin/leaves" element={<ProtectedRoute role="admin"><AdminLeaves /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute role="admin"><LeaveReports /></ProtectedRoute>} />
            <Route path="/admin/documents" element={<ProtectedRoute role="admin"><AdminDocuments /></ProtectedRoute>} />
            <Route path="/admin/helpdesk" element={<ProtectedRoute role="admin"><AdminHelpdesk /></ProtectedRoute>} />

            {/* EMPLOYEE ROUTES */}
            <Route path="/employee" element={<ProtectedRoute role="employee"><Employee /></ProtectedRoute>} />
            <Route path="/employee/leaves" element={<ProtectedRoute role="employee"><MyLeaves /></ProtectedRoute>} />
            <Route path="/employee/attendance" element={<ProtectedRoute role="employee"><AttendanceHistory /></ProtectedRoute>} />
            <Route path="/employee/vault" element={<ProtectedRoute role="employee"><DocumentVault /></ProtectedRoute>} />
            <Route path="/employee/helpdesk" element={<ProtectedRoute role="employee"><EmployeeHelpdesk /></ProtectedRoute>} />
            <Route path="/employee/financials" element={<ProtectedRoute role="employee"><EmployeeFinancials /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}
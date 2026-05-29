import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import OfflineBanner from './components/OfflineBanner';
import PageLoader from './components/PageLoader';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

import ProtectedRoute from './routes/ProtectedRoute';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import ViewOpenings from './pages/candidate/ViewOpenings';
import CandidateProfile from './pages/candidate/CandidateProfile';
import MyApplications from './pages/candidate/MyApplications';
import CandidateAptitudeTest from './pages/candidate/CandidateAptitudeTest';
import AdminDashboard from './pages/admin/AdminDashboard';
import JobListings from './pages/admin/JobListings';
import ManageUsers from './pages/admin/ManageUsers';
import AdminContactMessages from './pages/admin/AdminContactMessages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    if (sessionStorage.getItem('sessionExpired') === 'true') {
      toast.error("Your session has expired. Please log in again.", { duration: 6000 });
      sessionStorage.removeItem('sessionExpired');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            className: "!bg-white dark:!bg-zinc-900 !text-zinc-900 dark:!text-zinc-100 !border !border-zinc-200/50 dark:!border-zinc-800/50 !shadow-2xl !rounded-2xl !font-bold tracking-tight",
            style: {
              padding: "16px 20px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } }
          }}
        />

        <OfflineBanner />

        <AuthProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* CANDIDATE ROUTES */}
                <Route
                  path="/candidate/*"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <Routes>
                        <Route path="" element={<CandidateDashboard />} />
                        <Route path="openings" element={<ViewOpenings />} />
                        <Route path="applications" element={<MyApplications />} />
                        <Route path="profile" element={<CandidateProfile />} />
                        <Route path="test/:applicationId" element={<CandidateAptitudeTest />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />

                {/* ADMIN & HR ROUTES */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'hr']}>
                      <Routes>
                        <Route path="" element={<AdminDashboard />} />
                        <Route path="jobs" element={<JobListings />} />
                        <Route path="users" element={<ManageUsers />} />
                        <Route path="messages" element={<AdminContactMessages />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />

                {/* CATCH ALL ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

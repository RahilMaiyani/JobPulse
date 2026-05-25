import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import OfflineBanner from './components/OfflineBanner';
import PageLoader from './components/PageLoader';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import ProtectedRoute from './routes/ProtectedRoute';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import ViewOpenings from './pages/candidate/ViewOpenings';
import CandidateProfile from './pages/candidate/CandidateProfile';
import MyApplications from './pages/candidate/MyApplications';
import CandidateAptitudeTest from './pages/candidate/CandidateAptitudeTest';
import AdminDashboard from './pages/admin/AdminDashboard';
import JobListings from './pages/admin/JobListings';
import ManageUsers from './pages/admin/ManageUsers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            padding: "12px 20px",
            border: "1px solid rgba(255,255,255,0.1)"
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
                    </Routes>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

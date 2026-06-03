
import { getJobs, getActiveJobs } from '../services/jobService';
import { getAdminStats, getCandidateStats } from '../services/dashboardService';
import { getMyApplications } from '../services/applicationService';
import api from '../services/api';

const prefetchedRoutes = new Set();

export const prefetchRoute = (path, queryClient) => {
  if (prefetchedRoutes.has(path)) return;
  prefetchedRoutes.add(path);

  // console.log(`[Prefetch] Downloading code chunk for: ${path}`);

  switch (path) {
    // Admin Routes
    case '/admin':
      import('../pages/admin/AdminDashboard');
      if (queryClient) {
        queryClient.prefetchQuery({ queryKey: ['dashboard', 'admin'], queryFn: getAdminStats });
      }
      break;
    case '/admin/jobs':
      import('../pages/admin/JobListings');
      // Prefetch backend data!
      if (queryClient) {
        // console.log('[Prefetch] Fetching database data: admin jobs');
        queryClient.prefetchQuery({ queryKey: ['admin', 'jobs'], queryFn: getJobs });
      }
      break;
    case '/admin/users':
      import('../pages/admin/ManageUsers');
      break;
    case '/admin/messages':
      import('../pages/admin/AdminContactMessages');
      if (queryClient) {
        queryClient.prefetchQuery({ queryKey: ['contactMessages'], queryFn: async () => (await api.get('/contact')).data });
      }
      break;

    // Candidate Routes
    case '/candidate':
      import('../pages/candidate/CandidateDashboard');
      if (queryClient) {
        queryClient.prefetchQuery({ queryKey: ['dashboard', 'candidate'], queryFn: getCandidateStats });
      }
      break;
    case '/candidate/openings':
      import('../pages/candidate/ViewOpenings');
      // Prefetch backend data!
      if (queryClient) {
        // console.log('[Prefetch] Fetching database data: active openings');
        queryClient.prefetchQuery({ queryKey: ['jobs', 'active'], queryFn: getActiveJobs });
      }
      break;
    case '/candidate/applications':
      import('../pages/candidate/MyApplications');
      if (queryClient) {
        queryClient.prefetchQuery({ queryKey: ['applications', 'my'], queryFn: getMyApplications });
      }
      break;
    case '/candidate/profile':
      import('../pages/candidate/CandidateProfile');
      break;

    default:
      break;
  }
};

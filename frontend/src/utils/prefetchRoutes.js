/**
 * Prefetch component chunks by triggering their dynamic imports.
 * This tells Vite/Webpack to fetch the Javascript file for the page
 * before the user even clicks the link!
 */
export const prefetchRoute = (path) => {
  switch (path) {
    // Admin Routes
    case '/admin':
      import('../pages/admin/AdminDashboard');
      break;
    case '/admin/jobs':
      import('../pages/admin/JobListings');
      break;
    case '/admin/users':
      import('../pages/admin/ManageUsers');
      break;
    case '/admin/messages':
      import('../pages/admin/AdminContactMessages');
      break;

    // Candidate Routes
    case '/candidate':
      import('../pages/candidate/CandidateDashboard');
      break;
    case '/candidate/openings':
      import('../pages/candidate/ViewOpenings');
      break;
    case '/candidate/applications':
      import('../pages/candidate/MyApplications');
      break;
    case '/candidate/profile':
      import('../pages/candidate/CandidateProfile');
      break;
      
    default:
      break;
  }
};

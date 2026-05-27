import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const renderWithProviders = (ui, { route = '/', authState = { user: null }, themeState = { theme: 'light' } } = {}) => {
  window.history.pushState({}, 'Test page', route);

  const queryClient = createTestQueryClient();

  const mockAuthContext = {
    user: authState.user,
    token: 'fake-token',
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    loading: false,
    isCandidate: authState.user?.role === 'candidate',
    isAdmin: authState.user?.role === 'admin' || authState.user?.role === 'hr',
  };

  const mockThemeContext = {
    theme: themeState.theme,
    toggleTheme: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={mockThemeContext}>
        <AuthContext.Provider value={mockAuthContext}>
          <BrowserRouter>
            {ui}
          </BrowserRouter>
        </AuthContext.Provider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
};

export * from '@testing-library/react';

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/test-utils';
import { vi } from 'vitest';
import Home from '../../pages/Home';

describe('Home Component', () => {
  it('renders JobPulse title and description', () => {
    renderWithProviders(<Home />);
    
    expect(screen.getByText('JobPulse')).toBeInTheDocument();
    expect(screen.getByText(/Internal recruitment platform/i)).toBeInTheDocument();
  });

  it('renders welcome back message when user is logged in', () => {
    const mockUser = { full_name: 'Test Candidate', role: 'candidate' };
    renderWithProviders(<Home />, { authState: { user: mockUser } });
    
    expect(screen.getByText('Welcome back, Test Candidate!')).toBeInTheDocument();
    expect(screen.getByText(/You are logged in as a/i)).toBeInTheDocument();
    expect(screen.getByText('candidate')).toBeInTheDocument();
  });

  it('renders sign in and browse openings buttons when user is not logged in', () => {
    renderWithProviders(<Home />);
    
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });
});

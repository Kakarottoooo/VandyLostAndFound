// root/test/frontend/AuthContext.test.jsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Polyfill for window.matchMedia in case it’s missing in JSDOM.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),      // deprecated
      removeListener: jest.fn(),   // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock useNavigate from react-router-dom.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Import AuthContext from the correct path with extension.
import { AuthProvider, useAuth } from '../../frontend/src/context/AuthContext.jsx';

// A dummy consumer component to test AuthContext.
const DummyConsumer = () => {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading...' : 'Loaded'}</div>
      {user ? (
        <div data-testid="user">User: {user.name}</div>
      ) : (
        <div data-testid="no-user">No User</div>
      )}
      <button onClick={() => login('dummy-token')} data-testid="login-button">
        Login
      </button>
      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>
    </div>
  );
};

// Helper function to render the AuthProvider wrapped in a MemoryRouter.
const renderWithAuth = (ui) =>
  render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );

// Clear localStorage, mocks, and set a global fetch mock before each test.
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('AuthContext', () => {
  test('renders children and sets loading false if no token is present', async () => {
    renderWithAuth(<DummyConsumer />);
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded')
    );
    expect(screen.getByTestId('no-user')).toBeInTheDocument();
  });

  test('fetches user profile when token is present and response is ok', async () => {
    const fakeUser = { name: 'John Doe' };
    localStorage.setItem('token', 'valid-token');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: fakeUser }),
    });
    renderWithAuth(<DummyConsumer />);
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded')
    );
    expect(screen.getByTestId('user')).toHaveTextContent(`User: ${fakeUser.name}`);
  });

  test('calls logout if fetching user profile fails (response not ok)', async () => {
    localStorage.setItem('token', 'invalid-token');
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Unauthorized' }),
    });
    renderWithAuth(<DummyConsumer />);
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded')
    );
    // Expect logout to trigger navigation to '/login'
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(screen.getByTestId('no-user')).toBeInTheDocument();
  });

  test('login function stores token, fetches user profile, and navigates to /profile', async () => {
    const fakeUser = { name: 'Jane Doe' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: fakeUser }),
    });
    renderWithAuth(<DummyConsumer />);
    const loginButton = screen.getByTestId('login-button');
    fireEvent.click(loginButton);
    expect(localStorage.getItem('token')).toBe('dummy-token');
    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent(`User: ${fakeUser.name}`)
    );
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('logout function clears token, resets user, and navigates to /login', async () => {
    // Set up a valid token and simulate a successful fetch.
    localStorage.setItem('token', 'valid-token');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { name: 'John Doe' } }),
    });
    renderWithAuth(<DummyConsumer />);
    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('User: John Doe')
    );
    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(screen.getByTestId('no-user')).toBeInTheDocument();
  });
});

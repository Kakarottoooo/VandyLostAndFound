// test/frontend/Login.test.jsx
import * as React from 'react';
global.React = React;
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../frontend/src/pages/Login';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Stub window.matchMedia if not defined
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  });
}

// Mock the useAuth hook from your AuthContext
const mockLogin = jest.fn();
jest.mock('../../frontend/src/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock the useNavigate hook from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useToast hook from Chakra UI
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

// Helper function to wrap the component with providers
const renderWithProviders = (ui) =>
  render(
    <ChakraProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </ChakraProvider>
  );

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the login form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  test('successful login calls context login and navigates home', async () => {
    const fakeToken = 'fake-token';
    // Mock fetch to simulate a successful login response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: fakeToken }),
      })
    );

    renderWithProviders(<Login />);

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'password123' },
    });

    // Click the Login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for asynchronous operations to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
      expect(mockLogin).toHaveBeenCalledWith(fakeToken);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Login Successful',
          description: 'Welcome back!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('failed login shows error toast', async () => {
    const errorMsg = 'Invalid credentials';
    // Mock fetch to simulate a failed login response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ msg: errorMsg }),
      })
    );

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: errorMsg,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      );
    });
  });

  test('clicking the register button navigates to /register', () => {
    renderWithProviders(<Login />);
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});

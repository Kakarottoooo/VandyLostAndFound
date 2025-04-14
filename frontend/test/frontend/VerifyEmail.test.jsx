// root/test/frontend/VerifyEmail.test.jsx
import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import Verify from "../../frontend/src/pages/VerifyEmail";
import { ChakraProvider, useToast } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";

// Mocks
import { useNavigate } from "react-router-dom";
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

import { useAuth } from "../../frontend/src/context/AuthContext";
jest.mock("../../frontend/src/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@chakra-ui/react", () => {
  const actual = jest.requireActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: jest.fn(),
  };
});

// Helper to render with providers
const renderWithProviders = (ui) => {
  return render(
    <ChakraProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </ChakraProvider>
  );
};

describe("VerifyEmail Page", () => {
  const mockNavigate = jest.fn();
  const mockToast = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useToast.mockReturnValue(mockToast);
    useAuth.mockReturnValue({ login: mockLogin });
  });

  test("renders form inputs", () => {
    renderWithProviders(<Verify />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
  });

  test("successful verification logs in and navigates to home", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "mockToken" }),
    });

    renderWithProviders(<Verify />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@vanderbilt.edu" },
    });
    fireEvent.change(screen.getByLabelText(/Verification Code/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Verification Successful" })
      );
      expect(mockLogin).toHaveBeenCalledWith("mockToken");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("displays error toast on verification failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ msg: "Invalid code" }),
    });

    renderWithProviders(<Verify />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@vanderbilt.edu" },
    });
    fireEvent.change(screen.getByLabelText(/Verification Code/i), {
      target: { value: "000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Invalid code",
        })
      );
    });
  });

  test("displays server error toast on network failure", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    renderWithProviders(<Verify />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@vanderbilt.edu" },
    });
    fireEvent.change(screen.getByLabelText(/Verification Code/i), {
      target: { value: "654321" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Server Error" })
      );
    });
  });
});

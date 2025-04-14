import React from "react"; // Ensure React is defined
global.React = React;     // Set React globally (if needed)

import { render, fireEvent, waitFor } from "@testing-library/react";
import CreatePage from "../../frontend/src/pages/CreatePage"; // Corrected import path
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

// Mock the global fetch for API calls
global.fetch = jest.fn();

const renderWithProviders = (ui) =>
  render(
    <ChakraProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </ChakraProvider>
  );

describe("CreatePage", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders form fields", () => {
    const { getByPlaceholderText, getByLabelText, getByText } = renderWithProviders(<CreatePage />);
    // Using getByPlaceholderText for inputs that have placeholders
    expect(getByPlaceholderText(/Enter item name/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/Enter description/i)).toBeInTheDocument();
    // For the date input, use getByLabelText (since it doesn't have a placeholder)
    expect(getByLabelText(/Date Found/i)).toBeInTheDocument();
    expect(getByText(/Submit/i)).toBeInTheDocument();
  });

  test("submits form successfully", async () => {
    // Simulate a successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { getByPlaceholderText, getByLabelText, getByText } = renderWithProviders(<CreatePage />);

    fireEvent.change(getByPlaceholderText(/Enter item name/i), {
      target: { value: "Test Item" },
    });
    fireEvent.change(getByPlaceholderText(/Enter description/i), {
      target: { value: "Test Description" },
    });
    // Use getByLabelText for the date input
    fireEvent.change(getByLabelText(/Date Found/i), {
      target: { value: "2022-01-01" },
    });

    fireEvent.click(getByText(/Submit/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/items",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        })
      );
    });
  });

  test("handles error on submission", async () => {
    // Simulate an error response from the API
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Error occurred" }),
    });

    const { getByPlaceholderText, getByLabelText, getByText } = renderWithProviders(<CreatePage />);

    fireEvent.change(getByPlaceholderText(/Enter item name/i), {
      target: { value: "Test Item" },
    });
    fireEvent.change(getByPlaceholderText(/Enter description/i), {
      target: { value: "Test Description" },
    });
    fireEvent.change(getByLabelText(/Date Found/i), {
      target: { value: "2022-01-01" },
    });

    fireEvent.click(getByText(/Submit/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    // Optionally, add assertions to verify that an error toast was triggered.
  });
});

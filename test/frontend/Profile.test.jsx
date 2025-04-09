// test/frontend/Profile.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import Profile from "../../frontend/src/pages/Profile";
import { ChakraProvider } from "@chakra-ui/react";

// Polyfill for window.matchMedia (used by next-themes)
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  });
}

// Mock the useAuth hook from our AuthContext
jest.mock("../../frontend/src/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "../../frontend/src/context/AuthContext";

// Helper function to wrap the component with ChakraProvider
const renderWithProviders = (ui) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe("Profile Page", () => {
  test("renders a spinner when loading", () => {
    // When loading is true, the component should show a spinner.
    useAuth.mockReturnValue({ loading: true, user: null });
    renderWithProviders(<Profile />);
    // Instead of relying on role, check for the text "Loading..."
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test("renders 'No profile data available' when user is null", () => {
    useAuth.mockReturnValue({ loading: false, user: null });
    renderWithProviders(<Profile />);
    expect(screen.getByText(/No profile data available/i)).toBeInTheDocument();
  });

  test("renders user info with created and followed items when a user is provided", () => {
    const user = {
      name: "John Doe",
      email: "john@example.com",
      createdItems: [
        {
          _id: "1",
          name: "Created Item 1",
          dateFound: "2022-01-01T00:00:00.000Z",
          description: "Description 1",
        },
      ],
      followedItems: [
        {
          _id: "2",
          name: "Followed Item 1",
          dateFound: "2022-02-01T00:00:00.000Z",
          description: "Description 2",
        },
      ],
    };

    useAuth.mockReturnValue({ loading: false, user });
    renderWithProviders(<Profile />);

    // Check for the user's name and email
    expect(screen.getByRole("heading", { name: /john doe/i })).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();

    // Check that the "Created Items" section appears and renders the item
    expect(screen.getByRole("heading", { name: /Created Items/i })).toBeInTheDocument();
    expect(screen.getByText(/Created Item 1/i)).toBeInTheDocument();

    // Check that the "Followed Items" section appears and renders the item
    expect(screen.getByRole("heading", { name: /Followed Items/i })).toBeInTheDocument();
    expect(screen.getByText(/Followed Item 1/i)).toBeInTheDocument();
  });

  test("renders 'No created items found' when createdItems is empty", () => {
    const user = {
      name: "Jane Doe",
      email: "jane@example.com",
      createdItems: [],
      followedItems: [
        {
          _id: "3",
          name: "Followed Item",
          dateFound: "2022-03-01T00:00:00.000Z",
          description: "Description",
        },
      ],
    };

    useAuth.mockReturnValue({ loading: false, user });
    renderWithProviders(<Profile />);
    expect(screen.getByText(/No created items found/i)).toBeInTheDocument();
  });

  test("renders 'No followed items found' when followedItems is empty", () => {
    const user = {
      name: "Jane Doe",
      email: "jane@example.com",
      createdItems: [
        {
          _id: "4",
          name: "Created Item",
          dateFound: "2022-04-01T00:00:00.000Z",
          description: "Description",
        },
      ],
      followedItems: [],
    };

    useAuth.mockReturnValue({ loading: false, user });
    renderWithProviders(<Profile />);
    expect(screen.getByText(/No followed items found/i)).toBeInTheDocument();
  });
});

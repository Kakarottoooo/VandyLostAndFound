// test/frontend/HomePage.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "../../frontend/src/pages/HomePage"; // Note the 'frontend' folder in the path
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";

// Mock the useItemStore hook from the store
jest.mock("../../frontend/src/store/item", () => ({
  useItemStore: jest.fn(),
}));

import { useItemStore } from "../../frontend/src/store/item";

// A helper function to wrap components with providers
const renderWithProviders = (ui) => {
  return render(
    <ChakraProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </ChakraProvider>
  );
};

describe("HomePage", () => {
  const mockItems = [
    { _id: "1", name: "Item 1", dateFound: "2022-01-01" },
    { _id: "2", name: "Item 2", dateFound: "2022-02-01" },
  ];

  test('renders the "Current Items" heading', () => {
    useItemStore.mockImplementation(() => ({
      fetchItems: jest.fn(),
      searchQuery: "",
      setSearchQuery: jest.fn(),
      startDate: "",
      endDate: "",
      setStartDate: jest.fn(),
      setEndDate: jest.fn(),
      items: mockItems,
      filteredItems: () => mockItems,
    }));
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/Current Items/i)).toBeInTheDocument();
  });

  test("renders item cards when items are available", () => {
    useItemStore.mockImplementation(() => ({
      fetchItems: jest.fn(),
      searchQuery: "",
      setSearchQuery: jest.fn(),
      startDate: "",
      endDate: "",
      setStartDate: jest.fn(),
      setEndDate: jest.fn(),
      items: mockItems,
      filteredItems: () => mockItems,
    }));
    renderWithProviders(<HomePage />);
    // We assume that each ItemCard shows the item's name.
    expect(screen.getByText(/Item 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Item 2/i)).toBeInTheDocument();
  });

  test('renders "No items found" message when there are no items', () => {
    useItemStore.mockImplementation(() => ({
      fetchItems: jest.fn(),
      searchQuery: "",
      setSearchQuery: jest.fn(),
      startDate: "",
      endDate: "",
      setStartDate: jest.fn(),
      setEndDate: jest.fn(),
      items: [],
      filteredItems: () => [],
    }));
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/No items found/i)).toBeInTheDocument();
  });
});

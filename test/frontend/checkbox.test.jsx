import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider, Checkbox } from '@chakra-ui/react';

const renderWithChakra = (ui) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('Checkbox Component', () => {
  test('renders label text', () => {
    renderWithChakra(<Checkbox>Accept Terms</Checkbox>);
    expect(screen.getByText(/accept terms/i)).toBeInTheDocument();
  });

  test('checkbox toggles on click', () => {
    renderWithChakra(<Checkbox>Accept Terms</Checkbox>);

    // Query the checkbox by its role and accessible name
    const checkbox = screen.getByRole('checkbox', { name: /accept terms/i });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});

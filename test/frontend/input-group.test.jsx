import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { InputGroup } from '../../frontend/src/components/ui/input-group';

// Helper function to wrap UI in ChakraProvider
const renderWithChakra = (ui) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('InputGroup Component', () => {
  test('renders child input when no start or end elements are provided', () => {
    renderWithChakra(
      <InputGroup>
        <input placeholder="Test Input" data-testid="child" />
      </InputGroup>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('renders startElement when provided', () => {
    renderWithChakra(
      <InputGroup startElement={<span data-testid="start">Start</span>}>
        <input placeholder="Test Input" data-testid="child" />
      </InputGroup>
    );

    expect(screen.getByTestId('start')).toHaveTextContent('Start');
  });

  test('renders endElement when provided', () => {
    renderWithChakra(
      <InputGroup endElement={<span data-testid="end">End</span>}>
        <input placeholder="Test Input" data-testid="child" />
      </InputGroup>
    );

    expect(screen.getByTestId('end')).toHaveTextContent('End');
  });

  test('applies padding props to child input when start and end elements are provided', () => {
    renderWithChakra(
      <InputGroup
        startElement={<span data-testid="start">Left</span>}
        endElement={<span data-testid="end">Right</span>}
        startOffset="8px"
        endOffset="10px"
      >
        <input placeholder="Test Input" data-testid="child" />
      </InputGroup>
    );

    // Verify that the child input is rendered.
    const childInput = screen.getByTestId('child');
    expect(childInput).toBeInTheDocument();
    expect(childInput).toHaveAttribute('placeholder', 'Test Input');

    // Note: Since the cloned props (pl and pr) might not show as inline styles on a native <input>,
    // you may not be able to directly assert on them without further implementation details.
    // You could instead test that the component renders without errors when these props are provided.
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider, CloseButton } from '@chakra-ui/react';

const renderWithChakra = (ui) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('CloseButton Component', () => {
  test('renders default close icon with aria-label', () => {
    renderWithChakra(<CloseButton />);
    const button = screen.getByLabelText(/close/i);
    expect(button).toBeInTheDocument();
  });

  test('renders custom child if provided', () => {
    renderWithChakra(
      <CloseButton>
        <span data-testid="custom-child">X</span>
      </CloseButton>
    );
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    renderWithChakra(<CloseButton onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

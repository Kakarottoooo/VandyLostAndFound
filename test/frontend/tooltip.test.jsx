import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../../src/components/ui/tooltip'; // adjust path if needed

const renderWithChakra = (ui) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('Tooltip Component', () => {
  test('renders children when tooltip is disabled', () => {
    renderWithChakra(
      <Tooltip content="Tooltip content" disabled>
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByRole('button', { name: /hover me/i })).toBeInTheDocument();
  });

  test('shows tooltip content on hover when not disabled', async () => {
    renderWithChakra(
      <Tooltip content="Tooltip content" showArrow>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: /hover me/i });
    await userEvent.hover(button);

    expect(await screen.findByText('Tooltip content')).toBeInTheDocument();
  });

  test('hides tooltip content on unhover', async () => {
    renderWithChakra(
      <Tooltip content="Tooltip content" showArrow>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: /hover me/i });
    await userEvent.hover(button);
    expect(await screen.findByText('Tooltip content')).toBeInTheDocument();

    await userEvent.unhover(button);
    // wait for tooltip to disappear
    await new Promise((r) => setTimeout(r, 500));
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });
});

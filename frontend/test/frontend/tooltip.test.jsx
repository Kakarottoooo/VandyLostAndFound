// test/frontend/tooltip.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../../frontend/src/components/ui/tooltip'; // Adjusted path

const renderWithChakra = (ui) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('Tooltip Component', () => {
  test('renders children when tooltip is disabled', () => {
    renderWithChakra(
      <Tooltip disabled>
        <div>Tooltip Test</div>
      </Tooltip>
    );
    expect(screen.getByText('Tooltip Test')).toBeInTheDocument();
  });

  test('shows tooltip content on hover when not disabled', async () => {
    renderWithChakra(
      <Tooltip content="Tooltip Content" showArrow>
        <div>Hover Me</div>
      </Tooltip>
    );
    const trigger = screen.getByText('Hover Me');
    userEvent.hover(trigger);
    expect(await screen.findByText('Tooltip Content')).toBeInTheDocument();
    userEvent.unhover(trigger);
  });
});

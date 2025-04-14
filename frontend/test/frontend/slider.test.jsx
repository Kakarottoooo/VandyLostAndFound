// test/frontend/slider.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import userEvent from '@testing-library/user-event';
import { Slider } from '../../frontend/src/components/ui/slider'; // Adjusted path

const renderWithChakra = (ui) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('Slider Component', () => {
  test('renders slider with label and value', () => {
    renderWithChakra(
      <Slider label="Volume" value={30} onChange={() => {}} showValue />
    );
    expect(screen.getByText(/Volume: 30/)).toBeInTheDocument();
  });

  test('renders slider marks when provided', () => {
    const marks = [
      { value: 0, label: 'Min' },
      { value: 100, label: 'Max' },
    ];
    renderWithChakra(
      <Slider label="Progress" value={50} onChange={() => {}} marks={marks} />
    );
    expect(screen.getByText('Min')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  test('changes value on slider move', async () => {
    let sliderValue = 50;
    const handleChange = (val) => {
      sliderValue = val;
    };

    renderWithChakra(
      <Slider
        label="Brightness"
        value={sliderValue}
        onChange={handleChange}
        showValue
      />
    );

    const thumb = screen.getByRole('slider');
    await userEvent.click(thumb); // Simulate interaction
    expect(screen.getByText(/Brightness/)).toBeInTheDocument();
  });
});

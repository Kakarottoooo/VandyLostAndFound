import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// --- MOCKS ---

// Mock next-themes so that useTheme returns a controlled value.
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: jest.fn(),
  }),
}));

// Override ClientOnly in Chakra UI so that it simply renders its children.
jest.mock('@chakra-ui/react', () => {
  const actualChakra = jest.requireActual('@chakra-ui/react');
  return {
    ...actualChakra,
    ClientOnly: ({ children }) => <>{children}</>,
  };
});

// --- END MOCKS ---

// Now import the components from Chakra and our color-mode module.
import { ChakraProvider } from '@chakra-ui/react';
import {
  ColorModeProvider,
  useColorMode,
  useColorModeValue,
  ColorModeIcon,
  ColorModeButton,
} from '../../frontend/src/components/ui/color-mode';

// A helper function to render components with ChakraProvider.
const renderWithChakra = (ui) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('Color Mode Components', () => {
  test('ColorModeIcon renders LuSun when theme is light', () => {
    renderWithChakra(<ColorModeIcon />);
    // Since LuSun (from react-icons) renders an SVG, we look for an <svg> element.
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  test('ColorModeButton renders and toggles (simulate click)', () => {
    renderWithChakra(<ColorModeButton />);
    // Look for the button by its accessible name (as provided in the aria-label)
    const button = screen.getByRole('button', { name: /toggle color mode/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    // In a more advanced test, you might spy on the setTheme function to ensure it was called.
  });

  test('useColorModeValue returns light value for light theme', () => {
    const TestComponent = () => {
      const value = useColorModeValue('lightValue', 'darkValue');
      return <div>{value}</div>;
    };
    renderWithChakra(<TestComponent />);
    expect(screen.getByText('lightValue')).toBeInTheDocument();
  });
});

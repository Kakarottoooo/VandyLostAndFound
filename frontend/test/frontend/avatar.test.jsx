import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider, Avatar } from '@chakra-ui/react';

const renderWithChakra = (ui) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('Avatar Component', () => {
  test('renders initials if full name is provided', () => {
    renderWithChakra(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  test('renders only first initial if only first name is provided', () => {
    renderWithChakra(<Avatar name="Alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  test('renders image if src is provided (fallback used in JSDOM)', async () => {
    // Use a valid data URI; however, in JSDOM, the image onLoad won't fire,
    // so Chakra falls back to showing initials.
    const dataUri =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    await act(async () => {
      renderWithChakra(<Avatar name="Jane" src={dataUri} />);
    });
    // In JSDOM, the image likely won't be loaded, so Chakra shows fallback:
    // an element with role="img" and aria-label "Jane", containing "J"
    const avatarElement = screen.getByRole('img', { name: 'Jane' });
    expect(avatarElement).toBeInTheDocument();
    // Check that the fallback initials "J" are rendered
    expect(avatarElement).toHaveTextContent('J');
  });

  test('renders fallback icon if icon prop is provided', () => {
    renderWithChakra(<Avatar icon={<span data-testid="icon">*</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

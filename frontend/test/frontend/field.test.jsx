// test/frontend/field.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';

// We must also “fake” the Field sub‐components that our Field component uses.
jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    Field: {
      Root: (props) => <div data-testid="chakra-field-root" {...props} />,
      Label: (props) => <label data-testid="chakra-field-label" {...props} />,
      RequiredIndicator: (props) => <span data-testid="chakra-field-required-indicator" {...props} />,
      HelperText: (props) => <div data-testid="chakra-field-helpertext" {...props} />,
      ErrorText: (props) => <div data-testid="chakra-field-errortext" {...props} />,
    },
  };
});

import { Field } from '../../frontend/src/components/ui/field';

const renderWithChakra = (ui) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('Field Component', () => {
  test('renders label and children', () => {
    renderWithChakra(
      <Field label="Test Label">
        <div data-testid="field-child">Field Content</div>
      </Field>
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByTestId('field-child')).toBeInTheDocument();
  });

  test('renders helper text when provided', () => {
    renderWithChakra(
      <Field helperText="Helper Text">
        <div>Field Content</div>
      </Field>
    );
    expect(screen.getByText('Helper Text')).toBeInTheDocument();
  });

  test('renders error text when provided', () => {
    renderWithChakra(
      <Field errorText="Error Text">
        <div>Field Content</div>
      </Field>
    );
    expect(screen.getByText('Error Text')).toBeInTheDocument();
  });
});

// test/frontend/dialog.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';

// We override the Dialog parts that our component depends on.
jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    Dialog: {
      Backdrop: (props) => <div data-testid="dialog-backdrop" {...props} />,
      Positioner: (props) => <div data-testid="dialog-positioner" {...props} />,
      Content: (props) => <div data-testid="dialog-content" {...props} />,
      CloseTrigger: (props) => <div data-testid="dialog-close-trigger" {...props} />,
      Root: (props) => <div data-testid="dialog-root" {...props} />,
      Footer: (props) => <div data-testid="dialog-footer" {...props} />,
      Header: (props) => <div data-testid="dialog-header" {...props} />,
      Body: (props) => <div data-testid="dialog-body" {...props} />,
      Title: (props) => <div data-testid="dialog-title" {...props} />,
      Description: (props) => <div data-testid="dialog-description" {...props} />,
      Trigger: (props) => <div data-testid="dialog-trigger" {...props} />,
      ActionTrigger: (props) => <div data-testid="dialog-action-trigger" {...props} />,
    },
  };
});

import {
  DialogContent,
  DialogCloseTrigger,
  DialogRoot,
  DialogTitle,
} from '../../frontend/src/components/ui/dialog';

const renderWithChakra = (ui) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('Dialog Components', () => {
  test('DialogContent renders its children', () => {
    renderWithChakra(
      <DialogContent>
        <div data-testid="dialog-child">Dialog Content Test</div>
      </DialogContent>
    );
    expect(screen.getByTestId('dialog-child')).toBeInTheDocument();
  });

  test('DialogCloseTrigger renders a close button', () => {
    // Render a close trigger with some text.
    renderWithChakra(
      <DialogCloseTrigger>
        Close Dialog
      </DialogCloseTrigger>
    );
    // In our mock the CloseTrigger renders a <div> with data-testid "dialog-close-trigger"
    expect(screen.getByTestId('dialog-close-trigger')).toBeInTheDocument();
  });

  test('DialogRoot renders without crashing', () => {
    renderWithChakra(<DialogRoot data-testid="dialog-root" />);
    expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
  });

  test('DialogTitle renders provided text', () => {
    renderWithChakra(<DialogTitle>My Dialog Title</DialogTitle>);
    expect(screen.getByText('My Dialog Title')).toBeInTheDocument();
  });
});

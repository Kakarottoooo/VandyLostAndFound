// test/frontend/drawer.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';

// We override the Drawer parts so that its sub‐components exist.
jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    Drawer: {
      Backdrop: (props) => <div data-testid="drawer-backdrop" {...props} />,
      Positioner: (props) => <div data-testid="drawer-positioner" {...props} />,
      Content: (props) => <div data-testid="drawer-content" {...props} />,
      CloseTrigger: (props) => <div data-testid="drawer-close-trigger" {...props} />,
      Trigger: (props) => <div data-testid="drawer-trigger" {...props} />,
      Root: (props) => <div data-testid="drawer-root" {...props} />,
      Footer: (props) => <div data-testid="drawer-footer" {...props} />,
      Header: (props) => <div data-testid="drawer-header" {...props} />,
      Body: (props) => <div data-testid="drawer-body" {...props} />,
      Description: (props) => <div data-testid="drawer-description" {...props} />,
      ActionTrigger: (props) => <div data-testid="drawer-action-trigger" {...props} />,
      Title: (props) => <div data-testid="drawer-title" {...props} />,
    },
  };
});

import {
  DrawerContent,
  DrawerTitle,
  DrawerCloseTrigger,
} from '../../frontend/src/components/ui/drawer';

const renderWithChakra = (ui) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('Drawer Components', () => {
  test('DrawerContent renders its children', () => {
    renderWithChakra(
      <DrawerContent>
        <div data-testid="drawer-child">Drawer Content Test</div>
      </DrawerContent>
    );
    expect(screen.getByTestId('drawer-child')).toBeInTheDocument();
  });

  test('DrawerTitle renders provided text', () => {
    renderWithChakra(<DrawerTitle>My Drawer Title</DrawerTitle>);
    expect(screen.getByText('My Drawer Title')).toBeInTheDocument();
  });

  test('DrawerCloseTrigger renders a close button', () => {
    renderWithChakra(<DrawerCloseTrigger />);
    expect(screen.getByTestId('drawer-close-trigger')).toBeInTheDocument();
  });
});

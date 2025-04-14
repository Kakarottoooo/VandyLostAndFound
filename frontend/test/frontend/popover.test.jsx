import React from 'react';
import { render } from '@testing-library/react';
import {
  ChakraProvider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  Button,
} from '@chakra-ui/react';

// Helper to render with ChakraProvider
const renderWithChakra = (ui) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('Popover Components', () => {
  test('PopoverContent renders its children', () => {
    const { getByText } = renderWithChakra(
      <Popover isOpen>
        <PopoverTrigger>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Content</div>
        </PopoverContent>
      </Popover>
    );
    expect(getByText('Content')).toBeInTheDocument();
  });

  test('PopoverHeader renders its children', () => {
    const { getByText } = renderWithChakra(
      <Popover isOpen>
        <PopoverTrigger>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <div>Header Content</div>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    );
    expect(getByText('Header Content')).toBeInTheDocument();
  });

  test('PopoverBody renders its children', () => {
    const { getByText } = renderWithChakra(
      <Popover isOpen>
        <PopoverTrigger>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverBody>
            <div>Body Content</div>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
    expect(getByText('Body Content')).toBeInTheDocument();
  });

  test('PopoverFooter renders its children', () => {
    const { getByText } = renderWithChakra(
      <Popover isOpen>
        <PopoverTrigger>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverFooter>
            <div>Footer Content</div>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    );
    expect(getByText('Footer Content')).toBeInTheDocument();
  });
});

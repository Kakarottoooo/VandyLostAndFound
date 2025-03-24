// test/frontend/radio.test.jsx
import React from 'react';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Radio, RadioGroup } from '../../frontend/src/components/ui/radio';

const renderWithChakra = (ui) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('Radio Components', () => {
  test('Radio renders its children', () => {
    const { getByText } = renderWithChakra(
      <Radio value="1">Option 1</Radio>
    );
    expect(getByText('Option 1')).toBeInTheDocument();
  });

  test('RadioGroup renders multiple radios', () => {
    const { getByText } = renderWithChakra(
      <RadioGroup value="1">
        <Radio value="1">Option 1</Radio>
        <Radio value="2">Option 2</Radio>
      </RadioGroup>
    );
    expect(getByText('Option 1')).toBeInTheDocument();
    expect(getByText('Option 2')).toBeInTheDocument();
  });
});

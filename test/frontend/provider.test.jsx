// test/frontend/provider.test.jsx
import React from 'react';
import { render } from '@testing-library/react';
// Use the correct relative path (no extension needed)
import { Provider } from '../../frontend/src/components/ui/provider';

describe('Provider Component', () => {
  test('renders its children', () => {
    const { getByText } = render(
      <Provider>
        <div>Provider Test</div>
      </Provider>
    );
    expect(getByText('Provider Test')).toBeInTheDocument();
  });
});

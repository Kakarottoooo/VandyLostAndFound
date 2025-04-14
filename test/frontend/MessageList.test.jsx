import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageList from '../../../../frontend/src/components/chat/MessageList';
import { AuthContext } from '../../../../frontend/src/context/AuthContext';

const mockUser = { _id: 'user123', name: 'Self User' };
const partner = { name: 'Partner User' };

const renderWithAuth = (ui, user = mockUser) => {
  return render(
    <AuthContext.Provider value={{ user }}>
      {ui}
    </AuthContext.Provider>
  );
};

describe('MessageList', () => {
  it('renders "No messages yet" when empty', () => {
    renderWithAuth(<MessageList messages={[]} partner={partner} />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('renders grouped messages with date headings', () => {
    const today = new Date().toISOString();
    const messages = [
      {
        _id: '1',
        content: 'Hello from self',
        createdAt: today,
        sender: { _id: 'user123' }
      },
      {
        _id: '2',
        content: 'Hello from partner',
        createdAt: today,
        sender: { _id: 'partner456' }
      }
    ];

    renderWithAuth(<MessageList messages={messages} partner={partner} />);
    
    expect(screen.getByText(/hello from self/i)).toBeInTheDocument();
    expect(screen.getByText(/hello from partner/i)).toBeInTheDocument();
    expect(screen.getByText(/today/i)).toBeInTheDocument();
  });

  it('displays item info if a message has an attached item', () => {
    const messages = [
      {
        _id: '3',
        content: 'Found your umbrella!',
        createdAt: new Date().toISOString(),
        sender: { _id: 'user123' },
        item: {
          name: 'Black Umbrella',
          image: 'https://example.com/image.jpg'
        }
      }
    ];

    renderWithAuth(<MessageList messages={messages} partner={partner} />);
    
    expect(screen.getByText('Black Umbrella')).toBeInTheDocument();
    expect(screen.getByAltText('Black Umbrella')).toBeInTheDocument();
  });
});

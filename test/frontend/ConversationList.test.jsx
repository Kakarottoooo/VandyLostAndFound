import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConversationList from '../../../../frontend/src/components/chat/ConversationList';

describe('ConversationList', () => {
  const mockConversations = [
    {
      partner: { _id: '1', name: 'Alice' },
      latestMessage: { content: 'Hey there!', createdAt: new Date().toISOString() },
      unreadCount: 2,
    },
    {
      partner: { _id: '2', name: 'Bob' },
      latestMessage: { content: 'Long message from Bob that will be truncated in the UI.', createdAt: new Date().toISOString() },
      unreadCount: 0,
    },
  ];

  const mockActiveConversation = mockConversations[0];
  const onSelectConversation = jest.fn();

  it('renders "Conversations" heading', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeConversation={mockActiveConversation}
        onSelectConversation={onSelectConversation}
      />
    );
    expect(screen.getByText('Conversations')).toBeInTheDocument();
  });

  it('displays each partner name and latest message', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeConversation={null}
        onSelectConversation={onSelectConversation}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Hey there!')).toBeInTheDocument();
    expect(screen.getByText(/Long message from Bob/i)).toBeInTheDocument();
  });

  it('calls onSelectConversation when a conversation is clicked', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeConversation={null}
        onSelectConversation={onSelectConversation}
      />
    );
    fireEvent.click(screen.getByText('Alice'));
    expect(onSelectConversation).toHaveBeenCalledWith(mockConversations[0]);
  });

  it('renders "No conversations yet" when list is empty', () => {
    render(
      <ConversationList
        conversations={[]}
        activeConversation={null}
        onSelectConversation={onSelectConversation}
      />
    );
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });
});

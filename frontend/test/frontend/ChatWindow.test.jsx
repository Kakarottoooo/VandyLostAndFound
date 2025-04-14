import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatWindow from '../../../../frontend/src/components/chat/ChatWindow';
import { ChatContext } from '../../../../frontend/src/context/ChatContext';

// Mocked ChatContext data
const mockChatContext = {
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  setActiveConversation: jest.fn(),
  fetchConversations: jest.fn(),
  fetchMessages: jest.fn(),
  sendMessage: jest.fn(),
};

describe('ChatWindow', () => {
  it('renders "Messages" heading', () => {
    render(
      <ChatContext.Provider value={mockChatContext}>
        <ChatWindow />
      </ChatContext.Provider>
    );

    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  it('shows ConversationList when showConversations is true', () => {
    render(
      <ChatContext.Provider value={mockChatContext}>
        <ChatWindow />
      </ChatContext.Provider>
    );

    expect(screen.queryByText('Back to Conversations')).not.toBeInTheDocument();
  });

  it('renders partner info when activeConversation is set', () => {
    const activeMock = {
      partner: { name: 'Alice', email: 'alice@example.com', _id: '123' },
      latestMessage: null,
      unreadCount: 0,
    };

    render(
      <ChatContext.Provider value={{ ...mockChatContext, activeConversation: activeMock }}>
        <ChatWindow />
      </ChatContext.Provider>
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('calls fetchConversations on mount', () => {
    render(
      <ChatContext.Provider value={mockChatContext}>
        <ChatWindow />
      </ChatContext.Provider>
    );

    expect(mockChatContext.fetchConversations).toHaveBeenCalled();
  });
});

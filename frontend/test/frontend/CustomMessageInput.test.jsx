import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomMessageInput from '../../../../frontend/src/components/chat/CustomMessageInput';

describe('CustomMessageInput', () => {
  const mockSendMessage = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input and button', () => {
    render(<CustomMessageInput onSendMessage={mockSendMessage} />);
    
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('disables button when input is empty', () => {
    render(<CustomMessageInput onSendMessage={mockSendMessage} />);
    
    const button = screen.getByRole('button', { name: /send message/i });
    expect(button).toBeDisabled();
  });

  it('calls onSendMessage when send button is clicked with valid input', async () => {
    render(<CustomMessageInput onSendMessage={mockSendMessage} />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    const button = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(input, { target: { value: 'Hello world!' } });
    fireEvent.click(button);

    expect(mockSendMessage).toHaveBeenCalledWith('Hello world!');
  });

  it('clears the input after sending a message', async () => {
    render(<CustomMessageInput onSendMessage={mockSendMessage} />);

    const input = screen.getByPlaceholderText(/type your message/i);
    const button = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);

    await screen.findByPlaceholderText(/type your message/i);
    expect(input.value).toBe('');
  });

  it('submits message on Enter key press', () => {
    render(<CustomMessageInput onSendMessage={mockSendMessage} />);

    const input = screen.getByPlaceholderText(/type your message/i);

    fireEvent.change(input, { target: { value: 'Hello via Enter' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockSendMessage).toHaveBeenCalledWith('Hello via Enter');
  });
});

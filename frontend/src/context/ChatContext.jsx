// File: /frontend/src/context/ChatContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

// Create the context with a default value
const ChatContext = createContext({
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  loading: false,
  setActiveConversation: () => {},
  fetchConversations: () => Promise.resolve(),
  fetchMessages: () => Promise.resolve(),
  sendMessage: () => Promise.resolve(null),
  startItemConversation: () => Promise.resolve(false),
  fetchUnreadCount: () => Promise.resolve()
});

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Debounce function to prevent rapid consecutive calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/unread/count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUnreadCount(prevCount => 
          prevCount !== data.count ? data.count : prevCount
        );
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  // Fetch all conversations with improved performance
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConversations(prevConversations => {
          const newConversations = data.conversations;
          // Only update if conversations have changed
          return JSON.stringify(prevConversations) !== JSON.stringify(newConversations)
            ? newConversations 
            : prevConversations;
        });
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (partnerId, signal) => {
    if (!user || !partnerId) return;
    
    // Extract just the ID if partnerId is an object
    const actualPartnerId = typeof partnerId === 'object' ? 
      (partnerId._id || partnerId.id) : partnerId;
    
    if (!actualPartnerId) {
      console.error('Invalid partner ID format');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/${actualPartnerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(prevMessages => {
          const newMessages = data.messages;
          // Only update if messages have changed
          return JSON.stringify(prevMessages) !== JSON.stringify(newMessages)
            ? newMessages 
            : prevMessages;
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching messages:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Send a message with improved error handling and performance
  const sendMessage = useCallback(async (recipientId, content, itemId = null) => {
    if (!user || !recipientId || !content) return null;
    
    // Extract just the ID if recipientId is an object
    const actualRecipientId = typeof recipientId === 'object' ? 
      (recipientId._id || recipientId.id) : recipientId;
    
    if (!actualRecipientId) {
      console.error('Invalid recipient ID format');
      return null;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: actualRecipientId,
          content,
          itemId
        })
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data.success) {
        // Optimistically update messages
        setMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => msg._id === data.message._id);
          return messageExists 
            ? prevMessages 
            : [...prevMessages, data.message];
        });
        
        // Trigger conversation update
        await fetchConversations();
        return data.message;
      } else {
        console.error('Server returned error:', data.message);
        return null;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error sending message:', error);
      return null;
    }
  }, [user, fetchConversations]);

  // Start a new conversation about an item
  const startItemConversation = useCallback(async (itemOwnerId, itemId, initialMessage) => {
    if (!user || !itemOwnerId || !initialMessage) return false;
    
    // Extract just the ID if itemOwnerId is an object
    const actualOwnerId = typeof itemOwnerId === 'object' ? 
      (itemOwnerId._id || itemOwnerId.id) : itemOwnerId;
      
    if (!actualOwnerId) {
      console.error('Invalid item owner ID format');
      return false;
    }
    
    try {
      const message = await sendMessage(actualOwnerId, initialMessage, itemId);
      if (message) {
        setActiveConversation({
          partner: message.recipient,
          latestMessage: message,
          unreadCount: 0
        });
        setMessages([message]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return false;
    }
  }, [user, sendMessage]);

  // Fetch conversations and unread count when user changes
  useEffect(() => {
    let isMounted = true;
    const initializeChatData = async () => {
      if (user && isMounted) {
        await fetchConversations();
        await fetchUnreadCount();
      }
    };

    initializeChatData();

    return () => {
      isMounted = false;
    };
  }, [user, fetchConversations, fetchUnreadCount]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    conversations,
    activeConversation,
    messages,
    unreadCount,
    loading,
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startItemConversation,
    fetchUnreadCount
  }), [
    conversations, 
    activeConversation, 
    messages, 
    unreadCount, 
    loading, 
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startItemConversation,
    fetchUnreadCount
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};
// File: /frontend/src/pages/ChatPage.jsx
import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import ChatWindow from '../components/chat/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Navigate, useLocation } from 'react-router-dom';

const ChatPage = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { setActiveConversation, sendMessage } = useChat();
  
  // Check if we're coming from item detail with recipient info
  const navigationState = location.state || {};
  const { recipient, item, fromItemDetail } = navigationState;
  
  // When we navigate from item detail, set up the conversation
  useEffect(() => {
    if (fromItemDetail && recipient && user && !loading) {
      // Create a conversation object based on the recipient
      const conversation = {
        partner: recipient,
        latestMessage: {
          content: item ? `About: ${item.name}` : '',
          createdAt: new Date().toISOString()
        },
        unreadCount: 0
      };
      
      // Set the active conversation
      setActiveConversation(conversation);
      
      // Clear the navigation state after using it
      window.history.replaceState({}, document.title);
    }
  }, [fromItemDetail, recipient, user, loading, setActiveConversation, item]);
  
  if (loading) {
    return <Box p={10} textAlign="center">Loading...</Box>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Container maxW="container.lg" py={8}>
      <Heading mb={3}>Messages</Heading>
      <Text mb={6} color="gray.600" _dark={{ color: 'gray.400' }}>
        View and respond to messages about lost and found items.
      </Text>
      
      <ChatWindow 
        initialRecipient={recipient} 
        initialItem={item} 
      />
    </Container>
  );
};

export default ChatPage;
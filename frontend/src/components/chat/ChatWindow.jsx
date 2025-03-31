// File: /frontend/src/components/chat/ChatWindow.jsx
import React, { 
  useState, 
  useEffect, 
  useCallback
} from 'react';
import {
  Box,
  Flex,
  IconButton,
  Text,
  Heading,
  useColorModeValue,
  Divider,
  HStack,
  Avatar,
  Button,
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import CustomMessageInput from './CustomMessageInput';
import { useChat } from '../../context/ChatContext';

const ChatWindow = ({ initialRecipient = null, initialItem = null }) => {
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage
  } = useChat();
  
  // Colors - define at the top level
  const bgColor = useColorModeValue('white', 'gray.800');
  const headerBgColor = useColorModeValue('gray.50', 'gray.700');
  const avatarBgColor = useColorModeValue('blue.500', 'blue.200');
  
  // State
  const [showConversations, setShowConversations] = useState(!initialRecipient);
  
  // Callbacks
  const handleSendMessage = useCallback((messageText) => {
    if (!activeConversation?.partner?._id) return Promise.reject('No active conversation');
    
    return sendMessage(
      activeConversation.partner._id,
      messageText,
      initialItem ? initialItem._id : null
    );
  }, [activeConversation, sendMessage, initialItem]);
  
  const handleBackToConversations = useCallback(() => {
    setShowConversations(true);
    setActiveConversation(null); // Clear active conversation when going back
  }, [setActiveConversation]);
  
  const handleSelectConversation = useCallback((conversation) => {
    setActiveConversation(conversation);
    setShowConversations(false);
  }, [setActiveConversation]);
  
  // Group colors into an object
  const colors = {
    bgColor,
    headerBgColor,
    avatarBgColor
  };

  // Effects
  useEffect(() => {
    let isMounted = true;
    const initializeChat = async () => {
      try {
        await fetchConversations();
        
        if (isMounted && initialRecipient) {
          setActiveConversation({
            partner: initialRecipient,
            latestMessage: null,
            unreadCount: 0
          });
          setShowConversations(false);
        }
      } catch (error) {
        console.error('Chat initialization error:', error);
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
    };
  }, [initialRecipient, fetchConversations, setActiveConversation]);
  
  useEffect(() => {
    if (activeConversation?.partner) {
      const controller = new AbortController();
      
      // Extract ID if partner is an object
      const partnerId = typeof activeConversation.partner === 'object' ? 
        (activeConversation.partner._id || activeConversation.partner.id) : 
        activeConversation.partner;
        
      if (partnerId) {
        fetchMessages(partnerId, controller.signal);
      } else {
        console.error('Invalid partner ID format');
      }
      
      return () => controller.abort();
    }
  }, [activeConversation, fetchMessages]);
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      bg={colors.bgColor}
      position="relative"
      className="chat-window-container"
      sx={{
        '.chat-window-container div[class*="selection"], .chat-window-container div[id*="selection"]': {
          display: 'none !important',
          visibility: 'hidden !important'
        }
      }}
    >
      <Box p={4} bg={colors.headerBgColor}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="md">Messages</Heading>
          {!showConversations && (
            <Button 
              leftIcon={<FaArrowLeft />} 
              size="sm" 
              onClick={handleBackToConversations}
              variant="outline"
            >
              Back to Conversations
            </Button>
          )}
        </Flex>
      </Box>
      <Divider />
      
      <Flex direction={{ base: 'column', md: 'row' }} height="600px">
        {/* Conversations List Side */}
        {showConversations ? (
          <Box 
            width={{ base: '100%', md: '300px' }} 
            height="full" 
            borderRightWidth={{ md: '1px' }}
          >
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={handleSelectConversation}
            />
          </Box>
        ) : (
          /* Active Conversation Side */
          <Box 
            display="flex"
            flexDirection="column"
            height="full" 
            flex="1"
            width="100%"
          >
            {activeConversation?.partner && (
              <>
                {/* Header with user info */}
                <HStack p={4} justify="space-between" width="100%">
                  <HStack>
                    <IconButton
                      icon={<FaArrowLeft />}
                      size="sm"
                      variant="ghost"
                      onClick={handleBackToConversations}
                      display={{ base: 'flex', md: 'none' }}
                      aria-label="Back to conversations"
                    />
                    <Avatar 
                      name={activeConversation.partner.name} 
                      size="sm" 
                      bg={colors.avatarBgColor}
                    />
                    <Box>
                      <Text fontWeight="bold">{activeConversation.partner.name}</Text>
                      <Text fontSize="xs" color="gray.500">{activeConversation.partner.email}</Text>
                    </Box>
                  </HStack>
                </HStack>
                
                {/* Messages Area */}
                <Box flex="1" width="100%" overflowY="auto" px={4}>
                  <MessageList messages={messages} partner={activeConversation.partner} />
                </Box>
                
                {/* Input Area */}
                <Box width="100%" p={4} borderTopWidth="1px">
                  <CustomMessageInput onSendMessage={handleSendMessage} />
                </Box>
              </>
            )}
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default React.memo(ChatWindow);
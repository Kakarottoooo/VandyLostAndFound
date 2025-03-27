// File: /frontend/src/components/chat/ConversationList.jsx
import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  Text,
  Avatar,
  HStack,
  Badge,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';

const ConversationList = ({ conversations, activeConversation, onSelectConversation }) => {
  // Move ALL hooks to the top level - never call them conditionally or inside other functions
  const bgColor = useColorModeValue('white', 'gray.700');
  const activeBgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBgColor = useColorModeValue('gray.100', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.600');
  const scrollThumbColor = useColorModeValue('gray.300', 'gray.600');
  const avatarBgColor = useColorModeValue('blue.500', 'blue.200');
  const avatarTextColor = useColorModeValue('white', 'gray.800');

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <VStack
      spacing={0}
      align="stretch"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      h="full"
    >
      <Box p={3} bg={headerBgColor} fontWeight="bold">
        Conversations
      </Box>
      <Divider />
      <VStack
        spacing={0}
        align="stretch"
        overflowY="auto"
        maxH="500px"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: scrollThumbColor,
            borderRadius: '24px',
          },
        }}
      >
        {conversations.length === 0 ? (
          <Box p={4} textAlign="center" color="gray.500">
            No conversations yet
          </Box>
        ) : (
          conversations.map((conversation) => (
            <Box
              key={conversation.partner._id}
              p={3}
              cursor="pointer"
              bg={activeConversation?.partner._id === conversation.partner._id ? activeBgColor : bgColor}
              _hover={{ bg: hoverBgColor }}
              onClick={() => onSelectConversation(conversation)}
              borderBottomWidth="1px"
              borderColor={borderColor}
            >
              <HStack spacing={3} align="start">
                <Avatar 
                  name={conversation.partner.name} 
                  size="sm" 
                  bg={avatarBgColor}
                  color={avatarTextColor}
                />
                <Box flex="1">
                  <HStack justify="space-between">
                    <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                      {conversation.partner.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatTime(conversation.latestMessage.createdAt)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" mt={1}>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {conversation.latestMessage.content.length > 25
                        ? `${conversation.latestMessage.content.substring(0, 25)}...`
                        : conversation.latestMessage.content}
                    </Text>
                    {conversation.unreadCount > 0 && (
                      <Badge colorScheme="blue" borderRadius="full" px={2} fontSize="xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              </HStack>
            </Box>
          ))
        )}
      </VStack>
    </VStack>
  );
};

export default ConversationList;
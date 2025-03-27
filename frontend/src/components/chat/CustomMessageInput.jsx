// File: /frontend/src/components/chat/CustomMessageInput.jsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Input,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import { FaPaperPlane } from 'react-icons/fa';

const CustomMessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  
  const handleChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);
  
  const sendMessage = useCallback(() => {
    const trimmedMessage = message.trim();
    
    if (trimmedMessage && !isSubmitting) {
      setIsSubmitting(true);
      
      onSendMessage(trimmedMessage)
        .then(() => {
          setMessage('');
        })
        .catch(error => {
          console.error('Failed to send message:', error);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  }, [message, isSubmitting, onSendMessage]);
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);
  
  return (
    <Box 
      display="flex" 
      width="100%" 
      position="relative"
      alignItems="center"
    >
      <Input
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        padding="12px"
        paddingRight="50px"
        id="message-input"
        name="message-input"
        flex="1"
        width="100%"
        minHeight="50px"
      />
      <IconButton
        icon={<FaPaperPlane />}
        colorScheme="blue"
        onClick={sendMessage}
        isLoading={isSubmitting}
        isDisabled={!message.trim() || isSubmitting}
        aria-label="Send message"
        position="absolute"
        right="8px"
        zIndex="1"
        size="sm"
      />
    </Box>
  );
};

export default React.memo(CustomMessageInput);
// File: /frontend/src/components/MessageNotification.jsx
import React, { useEffect, useState } from 'react';
import { Box, Badge, Icon, Tooltip } from '@chakra-ui/react';
import { FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MessageNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up interval to check for unread messages
    const fetchUnreadCount = async () => {
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
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    // Fetch immediately on component mount
    fetchUnreadCount();
    
    // Then set up interval for periodic checks (every 30 seconds)
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, [user]);

  const handleClick = () => {
    navigate('/messages');
  };

  if (!user || unreadCount === 0) return null;

  return (
    <Tooltip label="Unread messages">
      <Box position="relative" display="inline-block" cursor="pointer" onClick={handleClick}>
        <Icon as={FaEnvelope} boxSize={6} />
        <Badge
          position="absolute"
          top="-5px"
          right="-5px"
          colorScheme="red"
          borderRadius="full"
          fontSize="xs"
        >
          {unreadCount}
        </Badge>
      </Box>
    </Tooltip>
  );
};

export default MessageNotification;
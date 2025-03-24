import { Button, Container, Flex, HStack, Text, useColorMode, Tooltip, Badge, Icon, Box } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusSquareIcon } from '@chakra-ui/icons';
import { IoMoon } from 'react-icons/io5';
import { LuSun } from 'react-icons/lu';
import { FaMap, FaEnvelope } from 'react-icons/fa'; // Import map and envelope icons
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

// Message notification component integrated directly in Navbar
const MessageNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user || unreadCount === 0) return null;

  return (
    <Tooltip label="Unread messages">
      <Box position="relative" display="inline-block" cursor="pointer" onClick={() => navigate('/messages')}>
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

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleCreateClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/create');
    }
  };

  return (
    <Container maxW="1140px" px={4}>
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        flexDir={{ base: 'column', sm: 'row' }}
      >
        <Text
          fontSize={{ base: '22', sm: '28' }}
          fontWeight="bold"
          textTransform="uppercase"
          textAlign="center"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
        >
          <Link to="/">Found Items</Link>
        </Text>

        <HStack spacing={2} alignItems="center">
          <Tooltip label="Add Item">
            <Button onClick={handleCreateClick}>
              <PlusSquareIcon fontSize={20} />
            </Button>
          </Tooltip>
          
          {/* Add Map Button */}
          <Tooltip label="View Map">
            <Button onClick={() => navigate('/map')}>
              <FaMap fontSize={18} />
            </Button>
          </Tooltip>
          
          {/* Message Notification */}
          {user && (
            <Tooltip label="Messages">
              <Button onClick={() => navigate('/messages')}>
                <Box position="relative">
                  <FaEnvelope fontSize={18} />
                  <MessageNotification />
                </Box>
              </Button>
            </Tooltip>
          )}
          
          <Tooltip label={colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}>
            <Button onClick={toggleColorMode}>
              {colorMode === 'light' ? <IoMoon /> : <LuSun size="20" />}
            </Button>
          </Tooltip>
          
          {!user ? (
            <>
              <Button colorScheme="blue" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button colorScheme="teal" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Button colorScheme="green" onClick={() => navigate('/profile')}>
                Profile
              </Button>
              <Button colorScheme="red" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;
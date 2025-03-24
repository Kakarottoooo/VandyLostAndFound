// ItemDetailModal.jsx
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Image,
  Box,
  Badge,
  Flex,
  Heading,
  Divider,
  VStack,
  HStack,
  useColorModeValue,
  useDisclosure,
  Textarea,
  useToast
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaCalendarAlt, FaTag, FaBuilding, FaComment } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ItemDetailModal = ({ isOpen, onClose, item }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const { isOpen: isContactOpen, onOpen: openContact, onClose: closeContact } = useDisclosure();
  
  if (!item) return null;
  
  // Check if the current user is the owner of the item
  const isOwner = user && item.user === user.id;
  
  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Only compute imageUrl if item.image exists
  const imageUrl = item.image
    ? (item.image.startsWith("http") ? item.image : `http://localhost:3000${item.image}`)
    : null;

  const badgeColor = item.itemType === 'found' ? 'green' : 'red';
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'white');

  // Handle opening contact modal
  const handleOpenContact = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to log in to contact the item owner",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }
    
    openContact();
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setSendingMessage(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: item.user,
          content: message,
          itemId: item._id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Message sent",
          description: "Your message has been sent successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setMessage('');
        closeContact();
        
        // Ask if they want to navigate to messages
        setTimeout(() => {
          toast({
            title: "View conversation",
            description: "Would you like to view the full conversation?",
            status: "info",
            duration: 5000,
            isClosable: true,
            action: (
              <Button 
                colorScheme="blue" 
                size="sm" 
                onClick={() => navigate('/messages')}
              >
                Go to Messages
              </Button>
            ),
          });
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send message",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Contact modal component
  const ContactModal = () => (
    <Modal isOpen={isContactOpen} onClose={closeContact} size="md">
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent bg={bgColor} color={textColor}>
        <ModalHeader>Contact About {item.name}</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Text mb={3}>
            Send a message to the {item.itemType === 'found' ? 'finder' : 'owner'} of this item:
          </Text>
          
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              item.itemType === 'found'
                ? "Hi, I believe this is my item. Can we arrange a meetup to verify?"
                : "Hi, I may have found your item. Can you provide more details?"
            }
            size="md"
            rows={5}
          />
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={closeContact}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSendMessage}
            isLoading={sendingMessage}
            loadingText="Sending"
          >
            Send Message
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent bg={bgColor} color={textColor}>
          <ModalHeader>
            <Flex justifyContent="space-between" alignItems="center">
              <Heading size="lg">{item.name}</Heading>
              <Badge colorScheme={badgeColor} fontSize="md" py={1} px={3} borderRadius="md">
                {item.itemType === 'found' ? 'FOUND' : 'LOST'}
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {imageUrl && (
              <Box mb={4} borderRadius="md" overflow="hidden">
                <Image 
                  src={imageUrl} 
                  alt={item.name} 
                  w="100%" 
                  maxH="400px" 
                  objectFit="cover"
                />
              </Box>
            )}
            
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="md" mb={2}>Description</Heading>
                <Text fontSize="md">{item.description}</Text>
              </Box>
              
              <Divider />
              
              <HStack>
                <FaCalendarAlt />
                <Text fontWeight="bold">Date {item.itemType === 'found' ? 'Found' : 'Lost'}:</Text>
                <Text>{formatDate(item.dateFound)}</Text>
              </HStack>
              
              <HStack>
                <FaTag />
                <Text fontWeight="bold">Category:</Text>
                <Text>{item.category}</Text>
              </HStack>
              
              <Divider />
              
              <Box>
                <Heading size="md" mb={2}>Location Information</Heading>
                
                <HStack mb={2}>
                  <FaBuilding />
                  <Text fontWeight="bold">Building:</Text>
                  <Text>{item.location?.building || 'Not specified'}</Text>
                </HStack>
                
                {item.location?.room && (
                  <HStack mb={2}>
                    <Box w="24px" /> {/* Spacer for alignment */}
                    <Text fontWeight="bold">Room:</Text>
                    <Text>{item.location.room}</Text>
                  </HStack>
                )}
                
                {item.location?.floor && (
                  <HStack mb={2}>
                    <Box w="24px" /> {/* Spacer for alignment */}
                    <Text fontWeight="bold">Floor:</Text>
                    <Text>{item.location.floor}</Text>
                  </HStack>
                )}
                
                {item.location?.coordinates && (
                  <HStack>
                    <FaMapMarkerAlt />
                    <Text fontWeight="bold">Exact Location:</Text>
                    <Text>{item.location.coordinates.lat.toFixed(6)}, {item.location.coordinates.lng.toFixed(6)}</Text>
                  </HStack>
                )}
              </Box>
              
              <Divider />
              
              <Text fontSize="sm" color="gray.500">
                Item ID: {item._id}
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            {!isOwner && (
              <Button 
                leftIcon={<FaComment />} 
                colorScheme="green" 
                mr={3} 
                onClick={handleOpenContact}
              >
                Contact
              </Button>
            )}
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Contact Modal - rendered conditionally to avoid rerendering issues */}
      {isContactOpen && <ContactModal />}
    </>
  );
};

export default ItemDetailModal;
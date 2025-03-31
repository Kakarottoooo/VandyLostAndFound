import React, { useState, useEffect } from 'react';
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
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaCalendarAlt, FaTag, FaBuilding, FaComment, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useItemStore } from '../store/useItemStore';

const ItemDetailModal = ({ isOpen, onClose, item }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const { isOpen: isContactOpen, onOpen: openContact, onClose: closeContact } = useDisclosure();

  // Get functions from the combined store
  const {
    isItemFollowed,
    toggleFollowStatus,
    followedItems,
    fetchFollowedItems
  } = useItemStore(state => ({
    isItemFollowed: state.isItemFollowed,
    toggleFollowStatus: state.toggleFollowStatus,
    followedItems: state.followedItems,
    fetchFollowedItems: state.fetchFollowedItems
  }));
  
  // Get follow status for this item
  const isFollowing = item ? isItemFollowed(item._id) : false;
  
  if (!item) return null;
  
  // Check if the current user is the owner of the item
  const isOwner = user && item.user === user._id;
  
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
      return dateString || "N/A";
    }
  };

  // Fetch followed items when component mounts
  useEffect(() => {
    if (user && followedItems.length === 0) {
      fetchFollowedItems();
    }
  }, [user, fetchFollowedItems, followedItems.length]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to log in to follow items",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    setIsFollowingLoading(true);
    
    try {
      const result = await toggleFollowStatus(item._id);
      
      if (result.success) {
        toast({
          title: isFollowing ? "Unfollowed" : "Following",
          description: isFollowing 
            ? "Item removed from your followed items" 
            : "Item added to your followed items",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update follow status",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsFollowingLoading(false);
    }
  };

  // Enhanced image URL handling for both Cloudinary and local paths
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Full URL (like Cloudinary or external source)
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    
    // Local /uploads/ path
    if (imageUrl.startsWith("/uploads")) {
      return `/api${imageUrl}`; 
    }
    
    // Cloudinary path without http
    return imageUrl;
  };

  const imageUrl = getImageUrl(item.image);

  const badgeColor = item.itemType === 'found' ? 'green' : 'red';
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'white');

  // Handle direct navigation to chat page
  const handleDirectNavigation = () => {
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
    
    // Close the detail modal
    onClose();
    
    // Navigate to messages page with recipient info
    navigate('/messages', {
      state: {
        recipient: {
          _id: item.user,
          name: item.userName || "Item Owner",
          email: item.userEmail || "No email available"
        },
        item: {
          _id: item._id,
          name: item.name,
          image: item.image
        },
        fromItemDetail: true
      }
    });
  };

  // Handle opening contact modal (legacy approach)
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

  // In your handleSendMessage function in ItemDetailModal.jsx
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
    
    // Log the item structure to debug
    console.log("Item data:", item);
    
    try {
      // Log debugging information
      console.log("Item data:", item);
      console.log("Recipient ID:", item.user);
      
      if (!item.user) {
        toast({
          title: "Error",
          description: "Cannot determine the recipient. The item may not have an owner assigned.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setSendingMessage(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Check what property contains the recipient ID
      // The issue might be that item.user isn't the correct property 
      // or that it doesn't contain the MongoDB ObjectId
      const recipientId = item.user?._id || item.user || item.userId;
      
      console.log("Sending message to recipient ID:", recipientId);
      
      if (!recipientId) {
        throw new Error("Cannot determine recipient ID");
      }
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: recipientId,
          content: message,
          itemId: item._id
        })
      });
      
      // Log the full response for debugging
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
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
        onClose(); // Close the item detail modal too
        
        // Navigate directly to chat
        navigate('/messages', {
          state: {
            recipient: {
              _id: item.user,
              name: item.userName || "Item Owner",
              email: item.userEmail || "No email available"
            },
            item: {
              _id: item._id,
              name: item.name,
              image: item.image
            },
            fromItemDetail: true
          }
        });
      } else {
        console.error("Server error response:", data);
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
        description: error.message || "Failed to send message. Please try again later.",
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
                  onError={(e) => {
                    console.error("Image failed to load:", imageUrl);
                    e.target.src = "https://via.placeholder.com/400?text=No+Image";
                  }}
                />
              </Box>
            )}
            
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="md" mb={2}>Description</Heading>
                <Text fontSize="md">{item.description || "No description available"}</Text>
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
                <Text>{item.category || "Not specified"}</Text>
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
                    <Text>
                      {typeof item.location.coordinates.lat === 'number' 
                        ? `${item.location.coordinates.lat.toFixed(6)}, ${item.location.coordinates.lng.toFixed(6)}`
                        : 'Coordinates not available'
                      }
                    </Text>
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
            {/* Follow button for all users except the owner */}
            {!isOwner && user && (
              <Tooltip label={isFollowing ? "Remove from followed items" : "Add to followed items"}>
                <Button
                  aria-label={isFollowing ? "Unfollow" : "Follow"}
                  onClick={handleFollowToggle}
                  isLoading={isFollowingLoading}
                  leftIcon={isFollowing ? <FaHeart /> : <FaRegHeart />}
                  colorScheme={isFollowing ? "red" : "gray"}
                  variant={isFollowing ? "solid" : "outline"}
                  mr={3}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </Tooltip>
            )}
            
            {!isOwner && (
              <Button 
                leftIcon={<FaComment />} 
                colorScheme="green" 
                mr={3} 
                onClick={handleDirectNavigation}
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
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Spinner,
  Button,
  useToast,
  Badge,
  Image,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, loading } = useAuth();
  const [userItems, setUserItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  // Fetch user's items directly
  useEffect(() => {
    if (user) {
      fetchUserItems();
    }
  }, [user]);

  const fetchUserItems = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setUserItems(data.data);
        console.log("Items loaded:", data.data.length);
      } else {
        console.error("Failed to fetch items:", data);
      }
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (itemId) => {
    setItemToDelete(itemId);
    onOpen();
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      onClose();
      
      if (response.ok && data.success) {
        // Remove item from local state
        setUserItems(items => items.filter(item => item._id !== itemToDelete));
        
        toast({
          title: "Item deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete item",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.includes("lost-and-found/")) return imagePath;
    return `/api${imagePath}`;
  };

  if (loading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box textAlign="center" mt="50px">
        <Text>Please log in to view your profile.</Text>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" py="8" px="4">
      {/* Profile Header */}
      <Box p="6" borderRadius="lg" boxShadow="md" mb="6">
        <HStack spacing="6">
          <Avatar name={user.name} size="xl" bg="purple.200" color="purple.900" />
          <Box>
            <Heading as="h2" size="lg">{user.name}</Heading>
            <Text>{user.email}</Text>
          </Box>
        </HStack>
      </Box>
      
      {/* Created Items Section */}
      <Box mb="8">
        <Heading as="h3" size="md" mb="4">Created Items</Heading>
        
        {userItems.length === 0 ? (
          <Text>No created items found.</Text>
        ) : (
          <VStack spacing="4" align="stretch">
            {userItems.map((item) => (
              <Box
                key={item._id}
                p="4"
                borderWidth="1px"
                borderRadius="md"
                boxShadow="sm"
              >
                <HStack justify="space-between" mb="2">
                  <HStack>
                    <Heading as="h4" size="md">{item.name}</Heading>
                    <Badge 
                      colorScheme={item.itemType === 'found' ? 'green' : 'red'}
                    >
                      {item.itemType === 'found' ? 'FOUND' : 'LOST'}
                    </Badge>
                  </HStack>
                  <Button
                    size="sm"
                    colorScheme="red"
                    leftIcon={<DeleteIcon />}
                    onClick={() => confirmDelete(item._id)}
                  >
                    Delete
                  </Button>
                </HStack>
                
                <HStack spacing="4" align="flex-start">
                  {item.image && (
                    <Image
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      boxSize="150px"
                      objectFit="cover"
                      borderRadius="md"
                      fallbackSrc="data:image/svg+xml;charset=UTF-8,%3Csvg width='150' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='150' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' alignment-baseline='middle' font-family='Arial, sans-serif' fill='%23999999'%3ENo Image%3C/text%3E%3C/svg%3E"
                    />
                  )}
                  
                  <Box flex="1">
                    <Text fontSize="sm">
                      {new Date(item.dateFound || item.dateLost || item.createdAt).toLocaleDateString()}
                    </Text>
                    <Text mt="2">{item.description}</Text>
                    {item.location && (
                      <Text fontSize="sm" mt="2">
                        Location: {typeof item.location === 'object' ? 
                          `${item.location.building || ''} ${item.location.room ? `Room ${item.location.room}` : ''}` : 
                          item.location}
                      </Text>
                    )}
                  </Box>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Item
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>Cancel</Button>
              <Button 
                colorScheme="red" 
                onClick={handleDeleteItem} 
                ml={3}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Profile;
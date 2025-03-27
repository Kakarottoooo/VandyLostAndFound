// In your Profile.jsx, add direct items fetching logic:
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Divider,
  Spinner,
  useColorModeValue,
  Button,
  Image,
  useToast,
  Badge,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, loading } = useAuth();
  const bgColor = useColorModeValue("white", "gray.700");
  const toast = useToast();
  const [userItems, setUserItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  // Fetch user's created items directly from all items

  useEffect(() => {
    const fetchUserItems = async () => {
      if (!user) return;
      
      try {
        setItemsLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/items', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Filter to only show items created by the current user
          const filteredItems = data.data.filter(item => 
            item.user && (
              item.user === user.id || 
              item.user._id === user.id
            )
          );
          setUserItems(filteredItems);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setItemsLoading(false);
      }
    };

    fetchUserItems();
  }, [user]);

  // Handle delete item
  const handleDeleteItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted item from the list
        setUserItems(prevItems => prevItems.filter(item => item._id !== itemId));
        
        toast({
          title: "Item deleted",
          description: "Your item has been successfully deleted",
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
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box textAlign="center" mt="50px">
        <Text>No profile data available.</Text>
      </Box>
    );
  }

  // Process image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `/api${imagePath}`;
  };

  return (
    <Box
      maxW="800px"
      mx="auto"
      mt="8"
      p="6"
      bg={bgColor}
      borderRadius="lg"
      boxShadow="lg"
    >
      <HStack spacing="6">
        <Avatar name={user.name} size="xl" />
        <Box>
          <Heading as="h2" size="lg">
            {user.name}
          </Heading>
          <Text color="gray.500">{user.email}</Text>
        </Box>
      </HStack>
      <Divider my="6" />

      <VStack align="start" spacing="4">
        <Heading as="h3" size="md">
          Created Items
        </Heading>
        {itemsLoading ? (
          <Spinner />
        ) : userItems && userItems.length > 0 ? (
          <VStack align="start" spacing="4" width="100%">
            {userItems.map((item) => (
              <Box
                key={item._id}
                p="4"
                borderWidth="1px"
                borderRadius="md"
                width="100%"
                position="relative"
              >
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Heading as="h4" size="md">
                      {item.name}
                    </Heading>
                    <Badge colorScheme={item.itemType === 'found' ? 'green' : 'red'}>
                      {item.itemType === 'found' ? 'FOUND' : 'LOST'}
                    </Badge>
                  </HStack>
                  <Button
                    size="sm"
                    colorScheme="red"
                    leftIcon={<DeleteIcon />}
                    onClick={() => handleDeleteItem(item._id)}
                  >
                    Delete
                  </Button>
                </HStack>
                
                {item.image && (
                  <Image
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    maxH="150px"
                    objectFit="cover"
                    borderRadius="md"
                    mb={2}
                    fallbackSrc="https://via.placeholder.com/150"
                  />
                )}
                
                <Text fontSize="sm" color="gray.500">
                  {new Date(item.dateFound).toLocaleDateString()}
                </Text>
                
                <Text mt="2">{item.description}</Text>
                
                {item.location && item.location.building && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Location: {item.location.building} {item.location.room ? `Room ${item.location.room}` : ''}
                  </Text>
                )}
              </Box>
            ))}
          </VStack>
        ) : (
          <Text color="gray.500">No created items found.</Text>
        )}
      </VStack>

      <Divider my="6" />

      <VStack align="start" spacing="4">
        <Heading as="h3" size="md">
          Followed Items
        </Heading>
        {user.followedItems && user.followedItems.length > 0 ? (
          <VStack align="start" spacing="4" width="100%">
            {user.followedItems.map((item) => (
              <Box
                key={item._id}
                p="4"
                borderWidth="1px"
                borderRadius="md"
                width="100%"
              >
                <Text fontWeight="bold" fontSize="lg">
                  {item.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(item.dateFound).toLocaleDateString()}
                </Text>
                <Text mt="2">{item.description}</Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text color="gray.500">No followed items found.</Text>
        )}
      </VStack>
    </Box>
  );
};

export default Profile;
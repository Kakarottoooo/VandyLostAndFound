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
  SimpleGrid,
  Button,
  useToast,
  Badge,
  Image,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
import ItemCard from "../components/ItemCard";

const Profile = () => {
  const { user, loading, userItems, itemsLoading, refreshUserItems } = useAuth();
  const token = localStorage.getItem('token');
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const bgColor = useColorModeValue("white", "gray.700");
  const toast = useToast();

  // Fetch user profile data
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      
      try {
        setProfileLoading(true);
        const res = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const data = await res.json();
        console.log("Profile data:", data); // Debug
        
        if (res.ok && data.user) {
          setUserProfile(data.user);
        } else {
          console.error("Failed to fetch profile:", data);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Handle unfollow item
  const handleUnfollow = async (itemId) => {
    try {
      const res = await fetch(`/api/users/unfollow/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Update local state immediately
        setUserProfile((prev) => ({
          ...prev,
          followedItems: prev.followedItems.filter((item) => item._id !== itemId),
        }));
        
        toast({
          title: "Item unfollowed",
          description: "You will no longer receive updates about this item",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh user items
        refreshUserItems();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to unfollow item",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error unfollowing:', err);
      toast({
        title: "Error",
        description: "Failed to unfollow item. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Item deleted",
          description: "Your item has been successfully deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh user items
        refreshUserItems();
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

  if (loading || profileLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!user || !userProfile) {
    return (
      <Box textAlign="center" mt="50px">
        <Text>No profile data available. Please make sure you're logged in.</Text>
      </Box>
    );
  }

  // Process image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Handle different image URL formats
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.includes("lost-and-found/")) {
      return imagePath; // Cloudinary URL should already be complete
    }
    
    return `/api${imagePath}`; // Add API prefix for local paths
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
        <Avatar name={userProfile.name} size="xl" />
        <Box>
          <Heading as="h2" size="lg">{userProfile.name}</Heading>
          <Text color="gray.500">{userProfile.email}</Text>
        </Box>
      </HStack>
      <Divider my="6" />
      
      <VStack align="start" spacing="4">
        <Heading as="h3" size="md">Created Items</Heading>
        {itemsLoading ? (
          <Spinner />
        ) : userItems && userItems.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
            {userItems.map((item) => (
              <Box
                key={item._id}
                p="4"
                borderWidth="1px"
                borderRadius="md"
                position="relative"
              >
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Heading as="h4" size="sm">
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
                    fallbackSrc="data:image/svg+xml;charset=UTF-8,%3Csvg width='150' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='150' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' alignment-baseline='middle' font-family='Arial, sans-serif' fill='%23999999'%3ENo Image%3C/text%3E%3C/svg%3E"
                  />
                )}
                
                <Text fontSize="sm" color="gray.500">
                  {new Date(item.dateFound).toLocaleDateString()}
                </Text>
                
                <Text mt="2" noOfLines={2}>{item.description}</Text>
                
                {item.location && item.location.building && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Location: {item.location.building} {item.location.room ? `Room ${item.location.room}` : ''}
                  </Text>
                )}
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text color="gray.500">No created items found.</Text>
        )}
      </VStack>
      
      <Divider my="6" />
      
      <VStack align="start" spacing="4">
        <Heading as="h3" size="md">Followed Items</Heading>
        {userProfile.followedItems && userProfile.followedItems.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
            {userProfile.followedItems.map((item) => (
              <Box key={item._id} position="relative">
                <ItemCard item={item} />
                <Button
                  size="sm"
                  colorScheme="red"
                  position="absolute"
                  top="2"
                  right="2"
                  onClick={() => handleUnfollow(item._id)}
                >
                  Unfollow
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text color="gray.500">No followed items found.</Text>
        )}
      </VStack>
    </Box>
  );
};

export default Profile;
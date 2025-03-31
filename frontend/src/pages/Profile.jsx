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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { DeleteIcon, StarIcon } from "@chakra-ui/icons";
import { FaHeart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ItemDetailModal from "../components/ItemDetailModal";
import { useItemStore } from "../store/useItemStore";

const Profile = () => {
  const { user, loading } = useAuth();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.700");

  // Get state and functions from combined store
  const {
    deleteItem,
    unfollowItem,
    fetchFollowedItems,
    followedItems,
    isLoadingFollowed,
    followedError
  } = useItemStore(state => ({
    deleteItem: state.deleteItem,
    unfollowItem: state.unfollowItem,
    fetchFollowedItems: state.fetchFollowedItems,
    followedItems: state.followedItems,
    isLoadingFollowed: state.isLoadingFollowed,
    followedError: state.followedError
  }));

  // Get user items
  const [userItems, setUserItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's items and followed items
  useEffect(() => {
    if (user) {
      fetchUserItems();
      fetchFollowedItems();
    }
  }, [user, fetchFollowedItems]);

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
      const result = await deleteItem(itemToDelete);
      
      onClose();
      
      if (result.success) {
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
          description: result.message || "Failed to delete item",
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

  const handleUnfollowItem = async (itemId) => {
    try {
      const result = await unfollowItem(itemId);
      
      if (result.success) {
        toast({
          title: "Unfollowed",
          description: "Item removed from your followed items",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to unfollow item",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error unfollowing item:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openItemDetails = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
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
      <Box p="6" borderRadius="lg" boxShadow="md" mb="6" bg={bgColor}>
        <HStack spacing="6">
          <Avatar name={user.name} size="xl" bg="purple.200" color="purple.900" />
          <Box>
            <Heading as="h2" size="lg">{user.name}</Heading>
            <Text>{user.email}</Text>
          </Box>
        </HStack>
      </Box>
      
      {/* Tabs for Created and Followed Items */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab><StarIcon mr="2" /> Created Items</Tab>
          <Tab><FaHeart style={{ marginRight: '8px' }} /> Followed Items</Tab>
        </TabList>
        
        <TabPanels>
          {/* Created Items Tab */}
          <TabPanel p={0} pt={4}>
            <Box>
              {isLoading ? (
                <Flex justify="center" mt="6">
                  <Spinner />
                </Flex>
              ) : userItems.length === 0 ? (
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
                      bg={bgColor}
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
          </TabPanel>
          
          {/* Followed Items Tab */}
          <TabPanel p={0} pt={4}>
            <Box>
              {isLoadingFollowed ? (
                <Flex justify="center" mt="6">
                  <Spinner />
                </Flex>
              ) : followedItems.length === 0 ? (
                <Text>No followed items found. Click the "Follow" button on items you want to keep track of.</Text>
              ) : (
                <VStack spacing="4" align="stretch">
                  {followedItems.map((item) => (
                    <Box
                      key={item._id}
                      p="4"
                      borderWidth="1px"
                      borderRadius="md"
                      boxShadow="sm"
                      bg={bgColor}
                      cursor="pointer"
                      _hover={{ shadow: "md" }}
                      onClick={() => openItemDetails(item)}
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
                          variant="outline"
                          leftIcon={<FaHeart />}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the box click event
                            handleUnfollowItem(item._id);
                          }}
                        >
                          Unfollow
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
          </TabPanel>
        </TabPanels>
      </Tabs>
      
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
      
      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={selectedItem}
        />
      )}
    </Box>
  );
};

export default Profile;
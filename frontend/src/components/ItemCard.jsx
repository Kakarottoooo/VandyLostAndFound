// ItemCard.jsx
import { useState, useRef } from "react";
import { 
  Box, 
  Heading, 
  Text, 
  Image, 
  useColorModeValue, 
  useColorMode,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  HStack,
  useToast
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ItemDetailModal from "../components/ItemDetailModal";
import { DeleteIcon } from "@chakra-ui/icons";
import { useItemStore } from "../store/useItemStore";

const ItemCard = ({ item }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colorMode } = useColorMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  // Delete dialog state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  
  // Get delete function from Zustand store
  const deleteItem = useItemStore(state => state.deleteItem);

  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.700", "white");

  const handleClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      // Open modal instead of navigating
      setIsModalOpen(true);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Case 1: Already a full URL (including Cloudinary URLs with http/https)
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    
    // Case 2: Cloudinary path pattern
    if (imageUrl.includes("lost-and-found/")) {
      // The URL is already in the correct format from Cloudinary's multer storage
      return imageUrl;
    }
    
    // Case 3: Local upload paths (legacy paths)
    if (imageUrl.startsWith("/uploads/")) {
      return `/api${imageUrl}`;
    }
    
    // Default case: Return the original path
    return imageUrl;
  };

  // Check if current user is the owner of this item
  const isOwner = user && item.user && (
    item.user === user.id || 
    item.user._id === user.id ||
    (typeof item.user === 'object' && item.user._id === user.id)
  );

  // Handle delete item with confirmation
  const handleDeleteItem = async () => {
    try {
      setIsDeleting(true);
      
      const result = await deleteItem(item._id);
      
      onClose(); // Close the dialog
      
      if (result.success) {
        toast({
          title: "Item deleted",
          description: "The item has been successfully deleted",
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
        description: "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get the properly formatted image URL
  const imageUrl = getImageUrl(item.image);

  // SVG data URI for fallback image
  const fallbackImageSrc = "data:image/svg+xml;charset=UTF-8,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' alignment-baseline='middle' font-family='Arial, sans-serif' fill='%23999999'%3ENo Image%3C/text%3E%3C/svg%3E";

  return (
    <>
      <Box
        shadow="lg"
        rounded="lg"
        overflow="hidden"
        transition="all 0.3s"
        _hover={{ transform: "translateY(-5px)", shadow: "xl", cursor: "pointer" }}
        p={4}
        bg={cardBg}
        maxW="300px"
        position="relative"
      >
        {/* Item Content - Clickable Area */}
        <Box onClick={handleClick}>
          {imageUrl && !imageError ? (
            <Image 
              src={imageUrl}
              alt={item.name || "Item image"}
              borderRadius="md"
              objectFit="cover"
              w="100%"
              h="200px"
              mb={3}
              onError={(e) => {
                console.error("Image failed to load:", imageUrl);
                setImageError(true);
                e.target.src = fallbackImageSrc;
              }}
            />
          ) : (
            <Box
              h="200px"
              bg="gray.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={3}
              borderRadius="md"
            >
              <Text>No Image</Text>
            </Box>
          )}
          <Heading as="h3" size="md" mb={2} color={textColor}>
            {item.name || "Unnamed Item"}
          </Heading>
          <Text fontWeight="bold" fontSize="xl" color={textColor} mb={2}>
            {item.description && item.description.length > 60
              ? `${item.description.substring(0, 60)}...`
              : item.description || "No description available"}
          </Text>
          <Text fontWeight="bold" fontSize="lg" color={useColorModeValue("gray.500", "gray.300")}>
            {item.itemType === 'lost' ? 'Lost on ' : 'Found on '}
            {item.dateFound ? new Date(item.dateFound).toLocaleDateString() : "Unknown date"}
          </Text>
        </Box>
        
        {/* Action Buttons */}
        {isOwner && (
          <HStack mt={4} justify="flex-end">
            <Button
              leftIcon={<DeleteIcon />}
              colorScheme="red"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click event
                onOpen();
              }}
            >
              Delete
            </Button>
          </HStack>
        )}
      </Box>

      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
      />
      
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
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDeleteItem} 
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ItemCard;
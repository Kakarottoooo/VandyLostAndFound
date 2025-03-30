// ItemCard.jsx
import { useState } from "react";
import { Box, Heading, Text, Image, useColorModeValue, useColorMode } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ItemDetailModal from "../components/ItemDetailModal";

const ItemCard = ({ item }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colorMode } = useColorMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

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
        onClick={handleClick}
        p={4}
        bg={cardBg}
        maxW="300px"
      >
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

      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
      />
    </>
  );
};

export default ItemCard;
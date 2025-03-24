// ItemCard.jsx
import { useState } from "react";
import { Box, Heading, Text, Image, useColorModeValue, useColorMode } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ItemDetailModal from '../components/ItemDetailModal'; 

const ItemCard = ({ item }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colorMode } = useColorMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Only compute imageUrl if item.image exists
  const imageUrl = item.image
    ? (item.image.startsWith("http") ? item.image : `http://localhost:3000${item.image}`)
    : null;

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
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={item.name} 
            borderRadius="md"
            objectFit="cover"
            w="100%"
            h="200px"
            mb={3}
          />
        ) : (
          <Box
            h="200px"
            bg="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={3}
          >
            <Text>No Image</Text>
          </Box>
        )}
        <Heading as="h3" size="md" mb={2} color={textColor}>
          {item.name}
        </Heading>
        <Text fontWeight="bold" fontSize="xl" color={textColor} mb={2}>
          {item.description.length > 60 
            ? `${item.description.substring(0, 60)}...` 
            : item.description}
        </Text>
        <Text fontWeight="bold" fontSize="lg" color={useColorModeValue("gray.500", "gray.300")}>
          Found on {new Date(item.dateFound).toLocaleDateString()}
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
// File: frontend/src/components/ItemCard.jsx
import { Box, Heading, Text, Image, useColorModeValue, useColorMode } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ItemCard = ({ item }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colorMode } = useColorMode();

  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.700", "white");

  const handleClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(`/item/${item._id}`); // Redirect to item details if authenticated
    }
  };

  // Only compute imageUrl if item.image exists
  const imageUrl = item.image
    ? (item.image.startsWith("http") ? item.image : `http://localhost:3000${item.image}`)
    : null;

   // ADD THESE LOGS FOR DEBUGGING:
  console.log("Item in ItemCard:", item);
  console.log("Computed Image URL:", imageUrl);

  return (
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
        {item.description}
      </Text>
      <Text fontWeight="bold" fontSize="lg" color={useColorModeValue("gray.500", "gray.300")}>
        Found on {item.dateFound.substring(0, 10)}
      </Text>
    </Box>
  );
};

export default ItemCard;

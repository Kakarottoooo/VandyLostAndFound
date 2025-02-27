import {
	Box,
	Button,
	Heading,
	HStack,
	IconButton,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useColorModeValue,
	useDisclosure,
	useToast,
	VStack,
	Badge,  // ✅ Import Badge from Chakra UI
  } from "@chakra-ui/react";
  import { useState } from "react";
  
  const ItemCard = ({ item }) => {
	const [isUrgent, setIsUrgent] = useState(item.urgent);
	const toast = useToast();
  
	// ✅ Function to toggle urgent status
	const toggleUrgent = async () => {
	  try {
		const response = await fetch(`http://localhost:5000/api/items/${item._id}/urgent`, {
		  method: "PATCH",
		  headers: {
			"Content-Type": "application/json",
		  },
		  body: JSON.stringify({ urgent: !isUrgent }),
		});
  
		if (response.ok) {
		  setIsUrgent(!isUrgent);
		  toast({
			title: `Item marked as ${!isUrgent ? "URGENT" : "not urgent"}`,
			status: "success",
			duration: 2000,
			isClosable: true,
		  });
		} else {
		  toast({
			title: "Failed to update urgency",
			status: "error",
			duration: 2000,
			isClosable: true,
		  });
		}
	  } catch (error) {
		console.error(error);
		toast({
		  title: "Error updating item",
		  status: "error",
		  duration: 2000,
		  isClosable: true,
		});
	  }
	};
  
	return (
	  <Box
		shadow="lg"
		rounded="lg"
		overflow="hidden"
		transition="all 0.3s"
		_hover={{ transform: "translateY(-5px)", shadow: "xl" }}
		p={4}
	  >
		{/* ✅ Show URGENT badge if item is marked urgent */}
		{isUrgent && (
		  <Badge colorScheme="red" fontSize="sm" position="absolute" top="2" right="2">
			URGENT
		  </Badge>
		)}
  
		<Heading size="md">{item.name}</Heading>
		<Text>{item.description}</Text>
  
		{/* ✅ Button to toggle "Urgent" status */}
		<Button
		  size="sm"
		  mt={2}
		  colorScheme={isUrgent ? "red" : "blue"}
		  onClick={toggleUrgent}
		>
		  {isUrgent ? "Remove Urgent" : "Mark as Urgent"}
		</Button>
	  </Box>
	);
  };
  
  export default ItemCard;
  
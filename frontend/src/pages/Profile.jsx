// File: frontend/src/pages/Profile.jsx
import React from "react";
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
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, loading } = useAuth();
  const bgColor = useColorModeValue("white", "gray.700"); // Use white in light mode, dark gray in dark mode

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

  return (
    <Box
      maxW="800px"
      mx="auto"
      mt="8"
      p="6"
      bg={bgColor}  // use dynamic background
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
        {user.createdItems && user.createdItems.length > 0 ? (
          <VStack align="start" spacing="4" width="100%">
            {user.createdItems.map((item) => (
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

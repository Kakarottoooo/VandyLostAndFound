// File: frontend/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Heading,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Correct Heroku URL
  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://vandy-lost-and-found-2ff42902dec4.herokuapp.com";

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email.toLowerCase().endsWith("@vanderbilt.edu")) {
      toast({
        title: "Invalid Email",
        description: "You must use a Vanderbilt University email.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    const requestData = { name, email, password };
    console.log("Sending registration data:", requestData);
    console.log("Using API URL:", API_URL);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Registration response:", data);

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Thanks! We've emailed you a verification code. Be sure to check your spam folder",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
                
        navigate("/verify"); // Redirect to verification page
      } else {
        // Better error handling for existing user
        if (data.msg === 'User already exists') {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please login instead or use a different email.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Registration Failed",
            description: data.msg || (data.errors && data.errors[0]?.msg) || "Registration failed. Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Server Error",
        description: `Failed to connect to the server at ${API_URL}. Please try again later.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt="50px" p="6" boxShadow="lg" borderRadius="md">
      <Heading mb="4">Register</Heading>
      <form onSubmit={handleRegister}>
        <VStack spacing="4">
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Enter your Vanderbilt email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>

          <Button colorScheme="blue" type="submit" isLoading={loading} width="full">
            Register
          </Button>

          <Text>
            Already have an account?{" "}
            <Button variant="link" colorScheme="blue" onClick={() => navigate("/login")}>
              Login
            </Button>
          </Text>
        </VStack>
      </form>
    </Box>
  );
};

export default Register;
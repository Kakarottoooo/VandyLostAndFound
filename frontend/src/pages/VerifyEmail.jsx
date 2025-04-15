// File: frontend/src/pages/VerifyEmail.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, FormControl, FormLabel, Heading, VStack, Text, useToast } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext"; // Import Auth

const Verify = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const { login } = useAuth(); // Use login function
    
    // Determine API URL based on environment with CORRECT Heroku URL
    const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:3000"
        : "https://vandy-lost-and-found-2ff42902dec4.herokuapp.com";
    
    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Using API URL:", API_URL);
        
        try {
            const response = await fetch(`${API_URL}/api/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, verificationCode: code })
                // Removed credentials: 'include'
            });

            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Verification response:", data);
            
            if (response.ok) {
                toast({
                    title: "Verification Successful",
                    description: "Thanks for verifying! Navigating you to the home page...",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                login(data.token); // Use the login function from context
                navigate("/"); 
            } else {
                toast({
                    title: "Verification Failed",
                    description: data.msg || "Verification failed. Please try again.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Verification error:", error);
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
            <Heading mb="4">Enter Verification Code</Heading>
            <Text mb="4">Please enter the verification code sent to your email.</Text>
            <form onSubmit={handleVerify}>
                <VStack spacing="4">
                    <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input type="email" placeholder="Enter your Vanderbilt email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Verification Code</FormLabel>
                        <Input type="text" placeholder="Enter your 6 digit verification code" value={code} onChange={(e) => setCode(e.target.value)} />
                    </FormControl>

                    <Button colorScheme="blue" type="submit" isLoading={loading} width="full">Verify</Button>
                </VStack>
            </form>
        </Box>
    );
};

export default Verify;
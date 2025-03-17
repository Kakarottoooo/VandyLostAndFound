import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, FormControl, FormLabel, Heading, VStack, Text, useToast } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext"; // Import Auth

const Verify = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState();
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const { login } = useAuth(); // Use login function
    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, verificationCode: code }),
            });

            const data = await response.json();
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
                    title: "Error",
                    description: data.msg || "Verification failed. Please try again.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Server Error",
                description: "Failed to connect to the server",
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
                        <Input type="number" placeholder="Enter your 6 digit verification code" value={code} onChange={(e) => setCode(e.target.value)} />
                    </FormControl>

                    <Button colorScheme="blue" type="submit" isLoading={loading} width="full">Register</Button>

                </VStack>
            </form>
        </Box>
    );
};

export default Verify;
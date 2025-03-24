import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, FormControl, FormLabel, Heading, VStack, Text, useToast } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
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

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                // Store token and login
                login(data.token, data.user);
                
                toast({
                    title: "Registration Successful",
                    description: "Welcome! Redirecting to homepage...",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                login(data.token); // ✅ Save token & log in user
            } else {
                // Handle different error formats
                const errorMessage = data.msg || (data.errors && data.errors[0]?.msg) || "Login failed";
                toast({
                    title: "Error",
                    description: data.msg || "Registration failed. Email may already be in use.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            toast({
                title: "Server Error",
                description: "Failed to connect to the server. Please try again later.",
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
            <Heading mb="4">Login</Heading>
            <form onSubmit={handleLogin}>
                <VStack spacing="4">
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
                        Login
                    </Button>

                    <Text>
                        Don't have an account?{" "}
                        <Button variant="link" colorScheme="blue" onClick={() => navigate("/register")}>
                            Register
                        </Button>
                    </Text>
                </VStack>
            </form>
        </Box>
    );
};

export default Login;
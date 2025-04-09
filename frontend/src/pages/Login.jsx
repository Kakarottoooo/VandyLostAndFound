import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Button, 
  Input, 
  FormControl, 
  FormLabel, 
  Heading, 
  Text, 
  Link, 
  Flex,
  useColorModeValue 
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // Color mode values
    const bgColor = useColorModeValue('#F0F4F8', '#171923');
    const headingColor = useColorModeValue('gray.700', 'white');
    const labelColor = useColorModeValue('gray.600', 'white');
    const buttonBg = useColorModeValue('#7BB2E7', '#7BB2E7');
    const buttonHoverBg = useColorModeValue('#90C1F0', '#90C1F0');
    const linkColor = useColorModeValue('#7BB2E7', '#7BB2E7');
    const textColor = useColorModeValue('gray.600', 'white');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

<<<<<<< HEAD
            const data = await response.json();
            if (response.ok) {
                // Store token and login
                login(data.token, data.user);
                navigate("/"); // Redirect to homepage
            } else {
                console.error("Login failed:", data.msg || "Unknown error");
            }
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxW="400px" mx="auto" mt="80px" bg={bgColor}>
            <Heading 
                textAlign="center" 
                fontSize="32px" 
                fontWeight="bold" 
                color={headingColor} 
                mb="24px"
            >
                Login
            </Heading>
            
            <form onSubmit={handleLogin}>
                <FormControl mb="16px">
                    <FormLabel 
                        color={labelColor} 
                        fontSize="md" 
                        fontWeight="normal" 
                        mb="8px"
                    >
                        Email <Text as="span" color="red.500">*</Text>
                    </FormLabel>
                    <Input 
                        type="email" 
                        placeholder="Enter your Vanderbilt email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        height="45px"
                        fontSize="md"
                    />
                </FormControl>
=======
      if (response.ok) {
        contextLogin(data.token);
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      } else {
        toast({
          title: 'Error',
          description: data.msg || 'Invalid credentials',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast({
        title: 'Server Error',
        description: 'Failed to connect to the server',
        status: 'error',
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
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
>>>>>>> newBranch

                <FormControl mb="20px">
                    <FormLabel 
                        color={labelColor} 
                        fontSize="md" 
                        fontWeight="normal" 
                        mb="8px"
                    >
                        Password <Text as="span" color="red.500">*</Text>
                    </FormLabel>
                    <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        height="45px"
                        fontSize="md"
                    />
                </FormControl>

                <Button 
                    bg={buttonBg}
                    color="black"
                    _hover={{ bg: buttonHoverBg }}
                    type="submit" 
                    isLoading={loading} 
                    width="full"
                    height="45px"
                    mb="16px"
                    fontSize="md"
                >
                    Login
                </Button>

                <Flex justify="center">
                    <Text color={textColor} fontSize="sm">
                        Don't have an account?{" "}
                        <Link
                            color={linkColor}
                            onClick={() => navigate("/register")}
                            _hover={{ textDecoration: 'underline' }}
                        >
                            Register
                        </Link>
                    </Text>
                </Flex>
            </form>
        </Box>
    );
};

export default Login;
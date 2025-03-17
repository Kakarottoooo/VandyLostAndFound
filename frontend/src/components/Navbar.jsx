import { Button, Container, Flex, HStack, Text, useColorMode } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusSquareIcon } from '@chakra-ui/icons';
import { IoMoon } from 'react-icons/io5';
import { LuSun } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleCreateClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/create');
    }
  };

  return (
    <Container maxW="1140px" px={4}>
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        flexDir={{ base: 'column', sm: 'row' }}
      >
        <Text
          fontSize={{ base: '22', sm: '28' }}
          fontWeight="bold"
          textTransform="uppercase"
          textAlign="center"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
        >
          <Link to="/">Found Items</Link>
        </Text>

        <HStack spacing={2} alignItems="center">
          <Button onClick={handleCreateClick}>
            <PlusSquareIcon fontSize={20} />
          </Button>
          <Button onClick={toggleColorMode}>
            {colorMode === 'light' ? <IoMoon /> : <LuSun size="20" />}
          </Button>
          {!user ? (
            <>
              <Button colorScheme="blue" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button colorScheme="teal" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Button colorScheme="green" onClick={() => navigate('/profile')}>
                Profile
              </Button>
              <Button colorScheme="red" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;

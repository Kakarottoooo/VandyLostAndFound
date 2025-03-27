// File: frontend/src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Box, Spinner, ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { extendTheme } from '@chakra-ui/react';

// Create a custom theme
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      blue: '#7BB2E7',
      blueHover: '#90C1F0',
      dark: '#1A202C',
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'light' ? '#F0F4F8' : '#171923',
        color: props.colorMode === 'light' ? 'gray.800' : 'white',
      },
    }),
  },
  components: {
    Input: {
      baseStyle: {
        field: {
          _dark: {
            bg: '#1A202C',
            color: 'gray.300',
          },
          _light: {
            bg: 'white',
            color: 'gray.800',
            border: '1px solid',
            borderColor: 'gray.300',
          },
        },
      },
    },
    Button: {
      variants: {
        primary: {
          bg: '#7BB2E7',
          color: 'black',
          _hover: {
            bg: '#90C1F0',
          },
        },
      },
    },
  },
});

// Lazy load pages to reduce initial bundle size
const HomePage = lazy(() => import('./pages/HomePage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Verify = lazy(() => import('./pages/VerifyEmail'));
const Profile = lazy(() => import('./pages/Profile'));
const CreatePage = lazy(() => import('./pages/CreatePage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <Box minH="100vh">
          <AuthProvider>
            <ChatProvider>
              <Navbar />
              <Suspense
                fallback={
                  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
                  </Box>
                }
              >
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify" element={<Verify />} />
                  <Route path="/map" element={<MapPage />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/create" element={<CreatePage />} />
                    <Route path="/messages" element={<ChatPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ChatProvider>
          </AuthProvider>
        </Box>
      </ChakraProvider>
    </>
  );
}

export default React.memo(App);
// File: frontend/src/theme.js
import { extendTheme } from '@chakra-ui/react';

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
      variants: {
        outline: (props) => ({
          field: {
            bg: props.colorMode === 'light' ? 'white' : '#1A202C',
            color: props.colorMode === 'light' ? 'gray.800' : 'gray.300',
            borderColor: props.colorMode === 'light' ? 'gray.300' : 'gray.600',
            _hover: {
              borderColor: 'blue.300',
            },
            _focus: {
              borderColor: 'blue.300',
              boxShadow: 'none',
            },
            _placeholder: {
              color: props.colorMode === 'light' ? 'gray.400' : 'gray.500',
            },
          },
        }),
      },
      defaultProps: {
        variant: 'outline',
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
    FormLabel: {
      baseStyle: (props) => ({
        color: props.colorMode === 'light' ? 'gray.700' : 'white',
      }),
    },
  },
});

export default theme;
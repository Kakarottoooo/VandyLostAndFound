import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Spinner,
  VStack,
  Container,
  useToast,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Button,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { GoogleMap, useJsApiLoader, OverlayView, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { FaSearch, FaTimesCircle } from 'react-icons/fa';

// Fixed import path based on your file structure
import ItemDetailModal from '../components/ItemDetailModal';

// Define libraries array outside component to avoid recreation on each render
const libraries = ['places'];

const containerStyle = {
  width: '100%',
  height: '75vh',
  borderRadius: '8px'
};

const center = {
  lat: 36.1447, // Vanderbilt University coordinates
  lng: -86.8027
};

const MapPage = () => {
  // Determine API URL based on environment
  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "/api"  // Use relative path in development
    : "https://vandy-lost-and-found-2ff42902dec4.herokuapp.com/api"; // Use full URL in production

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forceRerender, setForceRerender] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0); // Add refresh counter
  
  // Modal control with useDisclosure hook
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const toast = useToast();
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);
  
  // Color values
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.800');

  // Data URI for placeholder image (complies with CSP)
  const placeholderImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect fill="%23cccccc" width="50" height="50"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8" fill="%23333333"%3ENo Image%3C/text%3E%3C/svg%3E';

  // Use the hook instead of LoadScript component
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyABZL_QaY_H1POpxkebX9X-Jvysi2SwbzQ',
    libraries
  });

  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
    
    // Force re-render after map loads to ensure markers appear
    setTimeout(() => {
      setForceRerender(prev => prev + 1);
    }, 500);
  }, []);

  const onSearchBoxLoad = (ref) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = () => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      
      if (places && places.length > 0) {
        const place = places[0];
        
        if (!place.geometry || !place.geometry.location) {
          toast({
            title: "Location not found",
            description: "The selected place doesn't have location information",
            status: "error",
            duration: 3000,
            isClosable: true
          });
          return;
        }
        
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        // Update map center
        setMapCenter(newLocation);
        setSearchedLocation(newLocation);
        
        // Pan map to the location
        if (mapRef.current) {
          mapRef.current.panTo(newLocation);
          mapRef.current.setZoom(17);
        }
        
        toast({
          title: "Location found",
          description: `Found: ${place.formatted_address || place.name}`,
          status: "success",
          duration: 3000,
          isClosable: true
        });
      }
    }
  };

  // Fallback geocoding for direct search button clicks
  const handleSearch = useCallback(() => {
    if (!searchQuery || !isLoaded) return;
    
    setIsSearching(true);
    
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setIsSearching(false);
      
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const newCenter = {
          lat: location.lat(),
          lng: location.lng()
        };
        
        // Update map center
        setMapCenter(newCenter);
        setSearchedLocation(newCenter);
        
        // Pan map to the location
        if (mapRef.current) {
          mapRef.current.panTo(newCenter);
          mapRef.current.setZoom(17);
        }
        
        toast({
          title: "Location found",
          description: `Found: ${results[0].formatted_address}`,
          status: "success",
          duration: 3000,
          isClosable: true
        });
      } else {
        toast({
          title: "Location not found",
          description: "Could not find the location you searched for",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      }
    });
  }, [searchQuery, isLoaded, toast]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchedLocation(null);
    
    // Reset map to original center
    if (mapRef.current) {
      mapRef.current.panTo(center);
      mapRef.current.setZoom(16);
    }
    
    setMapCenter(center);
  }, []);

  const getImageUrl = (imageUrl) => {
    // Log for debugging
    console.log("Processing image URL:", imageUrl);
    
    // Always return the placeholder for any potential issue to avoid 404s
    try {
      // If no image or empty string, return placeholder
      if (!imageUrl || imageUrl === "") {
        console.log("No image URL provided, using placeholder");
        return placeholderImage;
      }
      
      // If it's already a complete Cloudinary URL (which most of your images seem to be)
      if (imageUrl.includes('cloudinary.com') || imageUrl.startsWith('http')) {
        console.log("Using direct image URL:", imageUrl);
        return imageUrl;
      }
      
      // For relative paths, we need to be careful about how we construct the URL
      // First, check if it's a path starting with /uploads
      if (imageUrl.includes('/uploads/') || imageUrl.startsWith('/uploads/')) {
        const cleanPath = imageUrl.replace(/^\/+/, ''); // Remove leading slashes
        const fullUrl = `${API_URL}/${cleanPath}`;
        console.log("Constructed URL for uploaded file:", fullUrl);
        return fullUrl;
      }
      
      // If we can't determine the proper URL construction, use placeholder
      console.log("Could not determine proper URL format, using placeholder");
      return placeholderImage;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return placeholderImage;
    }
  };

  // Add refresh items function with counter increment
  const refreshItems = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Filter for items with valid location data
        const itemsWithLocation = result.data.filter(item => {
          const hasCoordinates = item.location && 
                                item.location.coordinates && 
                                typeof item.location.coordinates.lat === 'number' && 
                                typeof item.location.coordinates.lng === 'number';
          
          return hasCoordinates;
        });
        
        // Log items for debugging
        console.log('Fetched items with coordinates:', itemsWithLocation);
        itemsWithLocation.forEach(item => {
          console.log(`Item ${item._id}:`, {
            name: item.name,
            imageUrl: item.image,
            constructedImageUrl: getImageUrl(item.image),
            coordinates: item.location?.coordinates
          });
        });
        
        setItems(itemsWithLocation);
        setRefreshCounter(prev => prev + 1); // Increment to trigger useEffect
        
        toast({
          title: "Map Refreshed",
          description: `Loaded ${itemsWithLocation.length} items with location data`,
          status: "success",
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error refreshing items:', error);
      toast({
        title: "Error Refreshing",
        description: "Could not refresh map items",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  }, [API_URL, toast]);

  // Force re-render when map is idle to ensure markers appear
  useEffect(() => {
    if (mapRef.current && isLoaded) {
      const listener = window.google.maps.event.addListener(
        mapRef.current,
        'idle',
        () => {
          setForceRerender(prev => prev + 1);
        }
      );
      
      return () => {
        window.google.maps.event.removeListener(listener);
      };
    }
  }, [isLoaded, mapRef.current]);

  // Updated useEffect with refreshCounter dependency
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/items`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Filter for items with valid location data
          const itemsWithLocation = result.data.filter(item => {
            const hasCoordinates = item.location && 
                                  item.location.coordinates && 
                                  typeof item.location.coordinates.lat === 'number' && 
                                  typeof item.location.coordinates.lng === 'number';
            
            return hasCoordinates;
          });
          
          // Log items for debugging
          console.log('Fetched items with coordinates:', itemsWithLocation);
          itemsWithLocation.forEach(item => {
            console.log(`Item ${item._id}:`, {
              name: item.name,
              imageUrl: item.image,
              constructedImageUrl: getImageUrl(item.image),
              coordinates: item.location?.coordinates
            });
          });
          
          setItems(itemsWithLocation);
          
          if (itemsWithLocation.length === 0) {
            toast({
              title: "No items with location data",
              description: "Try adding items with location coordinates first",
              status: "info",
              duration: 5000,
              isClosable: true
            });
          }
        } else {
          console.error('Failed to fetch items:', result.message);
        }
      } catch (error) {
        console.error('Error fetching items for map:', error);
        toast({
          title: "Error loading items",
          description: "Could not load items for the map",
          status: "error",
          duration: 5000,
          isClosable: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [toast, API_URL, refreshCounter]); // Added refreshCounter dependency

  const handleMarkerClick = (item) => {
    // Center the map on the selected item
    if (mapRef.current && item.location && item.location.coordinates) {
      mapRef.current.panTo({
        lat: item.location.coordinates.lat,
        lng: item.location.coordinates.lng
      });
    }
    
    // Set the selected item and open the modal
    setSelectedItem(item);
    onOpen();
  };

  // Handle modal close
  const handleModalClose = () => {
    onClose();
    setSelectedItem(null);
  };

  if (loading || !isLoaded) {
    return (
      <Box 
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="70vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Container maxW="1140px" py={6}>
      <VStack spacing={4} align="stretch" mb={6}>
        <Flex justify="space-between" align="center">
          <Heading>Lost & Found Map</Heading>
          <Button 
            onClick={refreshItems} 
            colorScheme="blue" 
            size="sm"
            isLoading={loading}
          >
            Refresh Map
          </Button>
        </Flex>
        <Text>
          Browse items on the map to see where they were found or lost. 
          Click on markers for more details.
        </Text>
        
        {/* Larger, more prominent search box using StandaloneSearchBox */}
        <Box 
          p={5} 
          borderWidth="1px" 
          borderRadius="lg" 
          overflow="hidden" 
          boxShadow="md"
          bg={bgColor}
        >
          {isLoaded && (
            <StandaloneSearchBox
              onLoad={onSearchBoxLoad}
              onPlacesChanged={onPlacesChanged}
            >
              <Flex direction={{ base: "column", md: "row" }} gap={4}>
                <InputGroup size="lg" flex="1">
                  <Input
                    placeholder="Search for a location or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={inputBg}
                    borderRadius="md"
                    borderColor={borderColor}
                    fontSize="md"
                    height="50px"
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                  />
                  <InputRightElement width="4.5rem" height="50px">
                    {searchQuery ? (
                      <IconButton
                        h="1.75rem"
                        size="sm"
                        icon={<FaTimesCircle />}
                        onClick={clearSearch}
                        variant="ghost"
                        aria-label="Clear search"
                      />
                    ) : null}
                  </InputRightElement>
                </InputGroup>
                <Button
                  colorScheme="blue"
                  isLoading={isSearching}
                  onClick={handleSearch}
                  leftIcon={<FaSearch />}
                  height="50px"
                  minWidth="120px"
                  fontSize="md"
                >
                  Search
                </Button>
              </Flex>
            </StandaloneSearchBox>
          )}
          <Text mt={2} fontSize="sm" color="gray.500">
            Type an address or location name to find places on the map
          </Text>
        </Box>
        
        <Text>
          Items loaded: {items.length} 
          {items.length === 0 && " (No items with valid coordinates found)"}
        </Text>
      </VStack>

      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={16}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            clickableIcons: false // Prevent clicks on Google's POI icons
          }}
        >
          {/* Searched location marker */}
          {searchedLocation && (
            <Marker
              position={searchedLocation}
              animation={window.google.maps.Animation.DROP}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new window.google.maps.Size(38, 38)
              }}
            />
          )}
          
          {/* Image markers for all items */}
          {items.map((item) => (
            <OverlayView
              key={`${item._id}-${forceRerender}`}
              position={{
                lat: item.location.coordinates.lat,
                lng: item.location.coordinates.lng
              }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                onClick={() => handleMarkerClick(item)}
                style={{
                  position: 'absolute',
                  top: '-25px',
                  left: '-25px',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `4px solid ${item.itemType === 'lost' ? '#E53E3E' : '#38A169'}`,
                  boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                  background: '#fff',
                  zIndex: 10,
                  cursor: 'pointer'
                }}
              >
                <img
                  src={getImageUrl(item.image)} 
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    console.log('Image load error for:', item.name);
                    e.target.src = placeholderImage;
                  }}
                />
              </div>
            </OverlayView>
          ))}
        </GoogleMap>
      </Box>
      
      {/* ItemDetailModal - will only show when isOpen is true and selectedItem exists */}
      {selectedItem && (
        <ItemDetailModal 
          isOpen={isOpen} 
          onClose={handleModalClose} 
          item={selectedItem} 
        />
      )}
    </Container>
  );
};

export default MapPage;
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Spinner,
  VStack,
  Badge,
  Container,
  useToast,
  Button,
  HStack,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { GoogleMap, useJsApiLoader, InfoWindow, OverlayView, Marker } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaCalendarAlt, FaTag, FaBuilding } from 'react-icons/fa';

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
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useCustomMarkers, setUseCustomMarkers] = useState(false);
  const toast = useToast();
  const mapRef = useRef(null);
  
  // Color values
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Use the hook instead of LoadScript component
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyABZL_QaY_H1POpxkebX9X-Jvysi2SwbzQ'
  });

  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/items', {
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
  }, [toast]);

  const handleMarkerClick = (item) => {
    setSelectedItem(item);
    
    // Center the map on the selected item
    if (mapRef.current && item.location && item.location.coordinates) {
      mapRef.current.panTo({
        lat: item.location.coordinates.lat,
        lng: item.location.coordinates.lng
      });
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedItem(null);
  };

  const toggleMarkerType = () => {
    setUseCustomMarkers(!useCustomMarkers);
  };

  // Function to format the date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Process image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("http") ? imageUrl : `/api${imageUrl}`;
  };

  // Prevent event propagation to the map
  const stopPropagation = (e) => {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
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
        <Heading>Lost & Found Map</Heading>
        <Text>
          Browse items on the map to see where they were found or lost. 
          Click on markers for more details.
        </Text>
        <Button onClick={toggleMarkerType} colorScheme="blue" size="sm" alignSelf="flex-start">
          {useCustomMarkers ? "Use Standard Markers" : "Use Image Markers"}
        </Button>
        <Text>
          Items loaded: {items.length} 
          {items.length === 0 && " (No items with valid coordinates found)"}
        </Text>
      </VStack>

      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={16}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            clickableIcons: false // Prevent clicks on Google's POI icons
          }}
        >
          {!useCustomMarkers ? (
            // Standard Google Maps markers
            items.map((item) => (
              <Marker
                key={item._id}
                position={{
                  lat: item.location.coordinates.lat,
                  lng: item.location.coordinates.lng
                }}
                onClick={() => handleMarkerClick(item)}
                icon={{
                  url: item.itemType === 'lost' 
                    ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' 
                    : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  scaledSize: isLoaded && window.google ? new window.google.maps.Size(30, 30) : null
                }}
              />
            ))
          ) : (
            // Custom image markers
            items.map((item) => (
              <OverlayView
                key={item._id}
                position={{
                  lat: item.location.coordinates.lat,
                  lng: item.location.coordinates.lng
                }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div
                  onClick={() => handleMarkerClick(item)}
                  style={{
                    position: 'relative',
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `3px solid ${item.itemType === 'lost' ? '#E53E3E' : '#38A169'}`,
                    boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                    background: '#fff'
                  }}
                >
                  <img
                    src={getImageUrl(item.image) || 'https://via.placeholder.com/50?text=No+Image'} 
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                    }}
                  />
                </div>
              </OverlayView>
            ))
          )}

          {selectedItem && (
            <InfoWindow
              position={{
                lat: selectedItem.location.coordinates.lat,
                lng: selectedItem.location.coordinates.lng
              }}
              onCloseClick={handleInfoWindowClose}
              options={{
                pixelOffset: new window.google.maps.Size(0, -5),
                disableAutoPan: false
              }}
            >
              <Box 
                p={3} 
                maxW="300px" 
                bg={bgColor} 
                color={textColor} 
                borderRadius="md"
                onClick={stopPropagation}
                onMouseDown={stopPropagation}
                onMouseUp={stopPropagation}
                onTouchStart={stopPropagation}
                onTouchEnd={stopPropagation}
                onDragStart={stopPropagation}
              >
                {/* Header with title and badge */}
                <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                  <Heading size="md" mb={1}>{selectedItem.name}</Heading>
                  <Badge 
                    colorScheme={selectedItem.itemType === 'found' ? 'green' : 'red'} 
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                  >
                    {selectedItem.itemType === 'found' ? 'FOUND' : 'LOST'}
                  </Badge>
                </Box>
                
                {/* Image */}
                {selectedItem.image && (
                  <Box my={3} borderRadius="md" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
                    <img 
                      src={getImageUrl(selectedItem.image)} 
                      alt={selectedItem.name} 
                      style={{ width: '100%', height: 'auto', maxHeight: '150px', objectFit: 'cover' }} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </Box>
                )}
                
                {/* Description */}
                <Box mb={3}>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Description:</Text>
                  <Text fontSize="sm">{selectedItem.description}</Text>
                </Box>
                
                <Divider my={2} />
                
                {/* Item details */}
                <VStack align="stretch" spacing={2} mt={2}>
                  <HStack>
                    <Box as={FaCalendarAlt} color={selectedItem.itemType === 'found' ? 'green.500' : 'red.500'} />
                    <Text fontSize="sm" fontWeight="bold">
                      {selectedItem.itemType === 'found' ? 'Found on:' : 'Lost on:'}
                    </Text>
                    <Text fontSize="sm">{formatDate(selectedItem.dateFound)}</Text>
                  </HStack>
                  
                  {selectedItem.category && (
                    <HStack>
                      <Box as={FaTag} color="blue.500" />
                      <Text fontSize="sm" fontWeight="bold">Category:</Text>
                      <Text fontSize="sm">{selectedItem.category}</Text>
                    </HStack>
                  )}
                </VStack>
                
                <Divider my={2} />
                
                {/* Location details */}
                <Box mt={2}>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Location:</Text>
                  
                  <HStack mt={1}>
                    <Box as={FaBuilding} color="purple.500" />
                    <Text fontSize="sm" fontWeight="bold">Building:</Text>
                    <Text fontSize="sm">{selectedItem.location.building || 'Not specified'}</Text>
                  </HStack>
                  
                  {selectedItem.location.room && (
                    <HStack mt={1} ml={6}>
                      <Text fontSize="sm" fontWeight="bold">Room:</Text>
                      <Text fontSize="sm">{selectedItem.location.room}</Text>
                    </HStack>
                  )}
                  
                  {selectedItem.location.floor && (
                    <HStack mt={1} ml={6}>
                      <Text fontSize="sm" fontWeight="bold">Floor:</Text>
                      <Text fontSize="sm">{selectedItem.location.floor}</Text>
                    </HStack>
                  )}
                  
                  <HStack mt={1}>
                    <Box as={FaMapMarkerAlt} color="red.500" />
                    <Text fontSize="sm" fontWeight="bold">Coordinates:</Text>
                    <Text fontSize="xs">
                      {selectedItem.location.coordinates.lat.toFixed(4)}, 
                      {selectedItem.location.coordinates.lng.toFixed(4)}
                    </Text>
                  </HStack>
                </Box>
                
                {/* Contact button or info could be added here */}
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  width="100%" 
                  mt={4}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add your contact or claim logic here
                    console.log("Contact about item:", selectedItem._id);
                  }}
                >
                  Contact About This Item
                </Button>
              </Box>
            </InfoWindow>
          )}
        </GoogleMap>
      </Box>
    </Container>
  );
};

export default MapPage;
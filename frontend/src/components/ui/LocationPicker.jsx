import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Spinner
} from '@chakra-ui/react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

// Vanderbilt University coordinates (default center)
const defaultCenter = {
  lat: 36.1447,
  lng: -86.8027
};

// Building coordinates at Vanderbilt with updated coordinates
const BUILDING_COORDINATES = {
  'Alumni Hall': { lat: 36.14805, lng: -86.80327 },
  'Blair School of Music': { lat: 36.13881, lng: -86.80510 },
  'Central Library': { lat: 36.14579, lng: -86.79998 },
  'Commons Center': { lat: 36.1486, lng: -86.79684 },
  'Engineering & Science Building': { lat: 36.14289, lng: -86.80578 },
  'Featheringill Hall': { lat: 36.14454, lng: -86.80362 },
  'Kirkland Hall': { lat: 36.14828, lng: -86.80277 },
  'Rand Hall': { lat: 36.14663, lng: -86.80273 },
  'Sarratt Student Center': { lat: 36.14620, lng: -86.80277 },
  'Student Life Center': { lat: 36.14449, lng: -86.80558 },
  'Wilson Hall': { lat: 36.14902, lng: -86.80039 }
};

const LocationPicker = ({ onSelectLocation, selectedBuilding }) => {
  const [marker, setMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const mapRef = useRef(null);
  const prevBuildingRef = useRef(selectedBuilding);
  const isFirstRender = useRef(true);
  
  // Use JsApiLoader instead of LoadScript
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyABZL_QaY_H1POpxkebX9X-Jvysi2SwbzQ'
  });

  // Handle map load
  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Update map center and marker when building changes
  useEffect(() => {
    // Skip on first render to avoid initial double callback
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevBuildingRef.current = selectedBuilding;
      return;
    }
    
    // Skip if the building hasn't actually changed
    if (selectedBuilding === prevBuildingRef.current) {
      return;
    }
    
    // Update the previous building reference
    prevBuildingRef.current = selectedBuilding;
    
    if (selectedBuilding && BUILDING_COORDINATES[selectedBuilding]) {
      const buildingCoords = BUILDING_COORDINATES[selectedBuilding];
      
      // Update map center
      setMapCenter(buildingCoords);
      
      // Set marker at building location when building changes
      setMarker(buildingCoords);
      
      // Only call the parent callback if we have valid coordinates
      if (onSelectLocation && typeof onSelectLocation === 'function') {
        onSelectLocation(buildingCoords);
      }
      
      // If map is loaded, pan to the building
      if (mapRef.current) {
        mapRef.current.panTo(buildingCoords);
        mapRef.current.setZoom(18);
      }
    }
  }, [selectedBuilding, onSelectLocation]);

  const handleMapClick = (e) => {
    const coordinates = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    setMarker(coordinates);
    
    if (onSelectLocation && typeof onSelectLocation === 'function') {
      onSelectLocation(coordinates);
    }
  };

  if (!isLoaded) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="400px"
        borderWidth="1px" 
        borderRadius="lg"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={18}
        onClick={handleMapClick}
        onLoad={onMapLoad}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          gestureHandling: 'greedy' // Allow easy scrolling
        }}
      >
        {marker && (
          <Marker
            position={marker}
            draggable={true}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: isLoaded && window.google ? new window.google.maps.Size(38, 38) : null
            }}
            animation={isLoaded && window.google ? window.google.maps.Animation.DROP : null}
            onDragEnd={(e) => {
              const newCoordinates = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              };
              setMarker(newCoordinates);
              
              if (onSelectLocation && typeof onSelectLocation === 'function') {
                onSelectLocation(newCoordinates);
              }
            }}
          />
        )}
      </GoogleMap>
      <Box p={2} textAlign="center">
        <Text fontSize="sm" color="gray.600">
          {selectedBuilding ? 
            `Map centered on ${selectedBuilding}. Click to set exact location or drag the marker to adjust.` : 
            `Select a building first, then click on the map to place your marker.`
          }
        </Text>
      </Box>
    </Box>
  );
};

export default LocationPicker;
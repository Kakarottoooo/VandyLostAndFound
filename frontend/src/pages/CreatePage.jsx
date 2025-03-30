import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  VStack,
  Text,
  useToast,
  Heading,
  Divider,
  Stack,
  Radio,
  RadioGroup,
  Textarea
} from "@chakra-ui/react";
import LocationPicker from "../components/ui/LocationPicker";

// Building options at Vanderbilt
const BUILDINGS = [
  'Alumni Hall',
  'Blair School of Music',
  'Central Library',
  'Commons Center',
  'Engineering & Science Building',
  'Featheringill Hall',
  'Kirkland Hall',
  'Rand Hall',
  'Sarratt Student Center',
  'Student Life Center',
  'Wilson Hall',
];

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Accessories',
  'Books',
  'ID/Cards',
  'Keys',
  'Other'
];

const CreatePage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dateFound, setDateFound] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("Other");
  const [itemType, setItemType] = useState("found");
  const [location, setLocation] = useState({
    building: "",
    room: "",
    floor: "",
    coordinates: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Store image file
  };

  const handleLocationSelect = (coordinates) => {
    setLocation(prevLocation => ({
      ...prevLocation,
      coordinates
    }));
  };

  const handleBuildingChange = (e) => {
    setLocation(prevLocation => ({
      ...prevLocation,
      building: e.target.value,
      coordinates: null // Reset coordinates when building changes
    }));
  };

  const handleRoomChange = (e) => {
    setLocation(prevLocation => ({
      ...prevLocation,
      room: e.target.value
    }));
  };

  const handleFloorChange = (e) => {
    setLocation(prevLocation => ({
      ...prevLocation,
      floor: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Validation
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter an item name",
        status: "error",
        duration: 3000
      });
      return;
    }

    if (!dateFound) {
      toast({
        title: "Date Required",
        description: "Please select the date when the item was found/lost",
        status: "error",
        duration: 3000
      });
      return;
    }

    if (!location.building) {
      toast({
        title: "Building Required",
        description: "Please select a building",
        status: "error",
        duration: 3000
      });
      return;
    }

    if (itemType === "found" && !location.coordinates) {
      toast({
        title: "Location Required",
        description: "Please select a location on the map",
        status: "error",
        duration: 3000
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("dateFound", dateFound);
      formData.append("category", category);
      formData.append("itemType", itemType);
      
      // Format the location data as a clean JSON string
      const locationData = {
        building: location.building,
        room: location.room || "",
        floor: location.floor || "",
        coordinates: location.coordinates || null
      };
      
      formData.append("location", JSON.stringify(locationData));
      
      if (image) {
        formData.append("image", image);
      }

      // Get the auth token from local storage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({ 
          title: "Authentication Error", 
          description: "You must be logged in to create an item",
          status: "error", 
          duration: 3000 
        });
        setIsSubmitting(false);
        navigate("/login");
        return;
      }
      
      // Debug: log what we're sending
      console.log("Submitting item with data:", {
        name,
        description,
        dateFound,
        category,
        itemType,
        location: locationData,
        hasImage: !!image
      });
      
      // Create the item
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      // Get response as text first for debugging
      const responseText = await response.text();
      console.log("Raw server response:", responseText);
      
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error("Error parsing response:", err);
        throw new Error("Could not parse server response");
      }

      // Check if the request was successful
      if (response.ok && data.success) {
        toast({ 
          title: "Item Created", 
          description: "Your item has been successfully created",
          status: "success", 
          duration: 3000 
        });
        navigate("/");
      } else {
        throw new Error(data.message || "Failed to create item");
      }
    } catch (error) {
      console.error("Error creating item:", error);
      toast({ 
        title: "Server Error", 
        description: error.message || "Failed to connect to the server. Please try again later.",
        status: "error", 
        duration: 3000 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="800px" mx="auto" mt="50px" p="6" boxShadow="lg" borderRadius="md">
      <Heading size="lg" mb={6}>
        {itemType === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
      </Heading>

      <form onSubmit={handleSubmit}>
        <VStack spacing="6" align="stretch">
          <FormControl>
            <FormLabel>Item Type</FormLabel>
            <RadioGroup value={itemType} onChange={setItemType}>
              <Stack direction="row">
                <Radio value="found">Found Item</Radio>
                <Radio value="lost">Lost Item</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              placeholder="Enter item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            <Select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Date {itemType === 'lost' ? 'Lost' : 'Found'}</FormLabel>
            <Input
              type="date"
              value={dateFound}
              onChange={(e) => setDateFound(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
            />
          </FormControl>

          <Divider />
          <Heading size="md">Location Information</Heading>

          <FormControl isRequired>
            <FormLabel>Building</FormLabel>
            <Select
              placeholder="Select building"
              value={location.building}
              onChange={handleBuildingChange}
            >
              {BUILDINGS.map((building) => (
                <option key={building} value={building}>{building}</option>
              ))}
            </Select>
          </FormControl>

          <Stack direction={["column", "row"]} spacing="4">
            <FormControl>
              <FormLabel>Room Number</FormLabel>
              <Input
                placeholder="e.g. 205"
                value={location.room || ""}
                onChange={handleRoomChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Floor</FormLabel>
              <Input
                placeholder="e.g. 2"
                value={location.floor || ""}
                onChange={handleFloorChange}
              />
            </FormControl>
          </Stack>

          {itemType === "found" && (
            <FormControl>
              <FormLabel>Pin Exact Location</FormLabel>
              <LocationPicker 
                onSelectLocation={handleLocationSelect} 
                selectedBuilding={location.building}
              />
              {location.coordinates && (
                <Text fontSize="sm" mt={2}>
                  Selected coordinates: {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
                </Text>
              )}
            </FormControl>
          )}

          <Divider />

          <FormControl>
            <FormLabel>Upload Image</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              p={1}
            />
            <Text fontSize="sm" color="gray.500" mt={1}>
              A clear image helps others identify the item
            </Text>
          </FormControl>

          <Button 
            colorScheme="blue" 
            type="submit" 
            size="lg" 
            mt={4}
            isLoading={isSubmitting}
            loadingText="Submitting..."
          >
            Submit
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CreatePage;
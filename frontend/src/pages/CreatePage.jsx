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
  RadioGroup
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
  
  const navigate = useNavigate();
  const toast = useToast();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Store image file
  };

  const handleLocationSelect = (coordinates) => {
    setLocation({
      ...location,
      coordinates
    });
  };

  const handleBuildingChange = (e) => {
    setLocation({
      ...location,
      building: e.target.value,
      coordinates: null // Reset coordinates when building changes
    });
  };

  const handleRoomChange = (e) => {
    setLocation({
      ...location,
      room: e.target.value
    });
  };

  const handleFloorChange = (e) => {
    setLocation({
      ...location,
      floor: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("dateFound", dateFound);
    formData.append("category", category);
    formData.append("itemType", itemType);
    formData.append("location", JSON.stringify(location));
    if (image) formData.append("image", image); // Append image if exists

    try {
      // Get the auth token from local storage
      const token = localStorage.getItem('token');
      
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Server response:", data);
      
      if (response.ok) {
        toast({ 
          title: "Item Created", 
          description: "Your item has been successfully created",
          status: "success", 
          duration: 3000 
        });
        navigate("/");
      } else {
        toast({ 
          title: "Error", 
          description: data.message || "Failed to create item", 
          status: "error", 
          duration: 3000 
        });
      }
    } catch (error) {
      console.error("Error creating item:", error);
      toast({ 
        title: "Server Error", 
        description: "Failed to connect to the server. Please try again later.",
        status: "error", 
        duration: 3000 
      });
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
            <Input
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            <FormLabel>Date Found</FormLabel>
            <Input
              type="date"
              value={dateFound}
              onChange={(e) => setDateFound(e.target.value)}
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
                value={location.room}
                onChange={handleRoomChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Floor</FormLabel>
              <Input
                placeholder="e.g. 2"
                value={location.floor}
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
          </FormControl>

          <Button colorScheme="blue" type="submit" size="lg" mt={4}>
            Submit
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CreatePage;
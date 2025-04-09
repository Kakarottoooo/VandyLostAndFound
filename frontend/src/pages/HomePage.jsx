import React from 'react';
import {
  Container,
  SimpleGrid,
  Text,
  VStack,
  Input,
  HStack,
  Button,
  Flex,
  Box,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Heading,
  IconButton,
  Divider,
  FormLabel,
  useToast,
  Image,
  Grid,
  GridItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useItemStore } from "../store/useItemStore";
import { 
  CalendarIcon, 
  SearchIcon, 
  CloseIcon, 
  AttachmentIcon 
} from "@chakra-ui/icons";
// Fix the import path to match your project structure
import ItemCard from "../components/ItemCard"; // Updated import path

const HomePage = () => {
  // Color mode values
  const filterBoxBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("white", "gray.800");
  const accordionHoverBg = useColorModeValue("gray.100", "gray.700");
  
  const {
    fetchItems,
    searchQuery,
    setSearchQuery,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    clearFilters,
    items,
    filteredItems,
    isLoading,
    error,
    setSelectedCategories: storeSetSelectedCategories,
    setSelectedItemType: storeSetSelectedItemType,
    setSelectedLocation: storeSetSelectedLocation,
    selectedCategories: storeSelectedCategories,
    selectedItemType: storeSelectedItemType,
    selectedLocation: storeSelectedLocation,
  } = useItemStore((state) => ({
    fetchItems: state.fetchItems,
    searchQuery: state.searchQuery,
    setSearchQuery: state.setSearchQuery,
    startDate: state.startDate,
    endDate: state.endDate,
    setStartDate: state.setStartDate,
    setEndDate: state.setEndDate,
    clearFilters: state.clearFilters,
    items: state.items,
    filteredItems: state.filteredItems,
    isLoading: state.isLoading,
    error: state.error,
    setSelectedCategories: state.setSelectedCategories,
    setSelectedItemType: state.setSelectedItemType,
    setSelectedLocation: state.setSelectedLocation,
    selectedCategories: state.selectedCategories,
    selectedItemType: state.selectedItemType,
    selectedLocation: state.selectedLocation,
  }));

  // Add state for new filters (using local state for UI, but syncing with store)
  const [selectedItemType, setSelectedItemType] = useState(storeSelectedItemType || "");
  const [selectedLocation, setSelectedLocation] = useState(storeSelectedLocation || "");
  const [selectedCategories, setSelectedCategories] = useState(storeSelectedCategories || []);
  const [availableCategories, setAvailableCategories] = useState([
    'Electronics', 'Clothing', 'Accessories', 'Books', 'ID/Cards', 'Keys', 'Other'
  ]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const fileInputRef = useRef(null);
  const toast = useToast();

  // Sync local state with store state when store state changes
  useEffect(() => {
    setSelectedItemType(storeSelectedItemType || "");
    setSelectedLocation(storeSelectedLocation || "");
    setSelectedCategories(storeSelectedCategories || []);
  }, [storeSelectedItemType, storeSelectedLocation, storeSelectedCategories]);

  useEffect(() => {
    // Fetch items on component mount
    fetchItems();
    
    // Fetch distinct categories from the backend if needed
    async function fetchCategories() {
      try {
        const response = await fetch('/api/items/categories');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAvailableCategories(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    // You can uncomment this when you implement the endpoint
    // fetchCategories();
    
  }, [fetchItems]);

  // Helper functions to toggle input type for date fields
  const handleFocus = (e) => {
    e.target.type = "date";
  };

  const handleBlur = (e) => {
    if (!e.target.value) {
      e.target.type = "text";
    }
  };

  // Handle category selection
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    
    let newCategories;
    if (checked) {
      newCategories = [...selectedCategories, value];
    } else {
      newCategories = selectedCategories.filter(cat => cat !== value); // Fixed
    }
    
    setSelectedCategories(newCategories);
    storeSetSelectedCategories(newCategories); // Update store
  };

  // Handle item type change
  const handleItemTypeChange = (e) => {
    const value = e.target.value;
    setSelectedItemType(value);
    storeSetSelectedItemType(value); // Update store
  };

  // Handle location change
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setSelectedLocation(value);
    storeSetSelectedLocation(value); // Update store
  };

  // Handle image upload for similarity search
  const handleImageSearch = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);
      
      toast({
        title: "Processing image",
        description: "Searching for similar items...",
        status: "info",
        duration: 3000,
      });
      
      // This will need to be implemented in the backend
      const response = await fetch('/api/items/image-search', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Handle successful image search
          toast({
            title: "Image Search Complete",
            description: `Found ${result.data.length} matching items`,
            status: "success",
            duration: 3000,
          });
        } else {
          toast({
            title: "Image Search Error",
            description: result.message || "Failed to process image search",
            status: "error",
            duration: 5000,
          });
        }
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image for search",
        status: "error",
        duration: 5000,
      });
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  // Apply filters with debug logging
  const applyFilters = () => {
    console.log("Applying filters:");
    console.log("Search Query:", searchQuery);
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Selected Categories:", selectedCategories);
    console.log("Item Type:", selectedItemType);
    console.log("Location:", selectedLocation);
    
    // Make sure store values are updated before fetching
    storeSetSelectedCategories(selectedCategories);
    storeSetSelectedItemType(selectedItemType);
    storeSetSelectedLocation(selectedLocation);
    
    // Add this to log the API request URL
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (selectedLocation) params.append("location", selectedLocation);
    if (selectedItemType) params.append("itemType", selectedItemType);
    if (selectedCategories.length > 0) {
      selectedCategories.forEach(category => {
        params.append("category", category);
      });
    }
    
    console.log("API request will be:", `/api/items?${params.toString()}`);
    
    fetchItems();
  };

  // Reset all filters
  const handleClearFilters = () => {
    setSelectedItemType("");
    setSelectedLocation("");
    setSelectedCategories([]);
    
    // Update store values
    storeSetSelectedCategories([]);
    storeSetSelectedItemType("");
    storeSetSelectedLocation("");
    
    clearFilters();
    fetchItems();
  };

  // Handle removing individual tags
  const handleRemoveCategory = (category) => {
    const newCategories = selectedCategories.filter(cat => cat !== category);
    setSelectedCategories(newCategories);
    storeSetSelectedCategories(newCategories);
  };

  const handleRemoveItemType = () => {
    setSelectedItemType("");
    storeSetSelectedItemType("");
  };

  const handleRemoveLocation = () => {
    setSelectedLocation("");
    storeSetSelectedLocation("");
  };

  // Get sorted and filtered items
  const sortedFilteredItems = filteredItems();

  // Toggle filters section
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6}>
        <Text
          fontSize="30"
          fontWeight="bold"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
          textAlign="center"
        >
          Current Items 🚀
        </Text>

        {/* Main Search Bar */}
        <Box width="100%" p={4} borderWidth="1px" borderRadius="lg" bg={filterBoxBg} shadow="md">
          <VStack spacing={4} align="stretch">
            {/* Search Input */}
            <HStack>
              <Input
                placeholder="Search by items e.g. Watch, Laptop"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="lg"
                bg={inputBg}
              />
              <Button colorScheme="blue" size="lg" leftIcon={<SearchIcon />} onClick={applyFilters}>
                Search
              </Button>
            </HStack>

            {/* Filters Accordion */}
            <Accordion allowToggle>
              <AccordionItem border="none">
                <h2>
                  <AccordionButton 
                    _hover={{ bg: accordionHoverBg }} 
                    borderRadius="md"
                    onClick={toggleFilters}
                  >
                    <Box as="span" flex='1' textAlign='left' fontWeight="medium">
                      {isFiltersOpen ? "Hide Filters" : "Show Filters"}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Grid 
                    templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
                    gap={4}
                  >
                    {/* Date Filters */}
                    <GridItem>
                      <VStack align="start" spacing={2}>
                        <FormLabel htmlFor="startDate" fontWeight="medium">From Date</FormLabel>
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate || ""}
                          onChange={(e) => setStartDate(e.target.value)}
                          bg={inputBg}
                        />
                      </VStack>
                    </GridItem>

                    <GridItem>
                      <VStack align="start" spacing={2}>
                        <FormLabel htmlFor="endDate" fontWeight="medium">To Date</FormLabel>
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate || ""}
                          onChange={(e) => setEndDate(e.target.value)}
                          bg={inputBg}
                        />
                      </VStack>
                    </GridItem>

                    {/* Item Type Filter */}
                    <GridItem>
                      <VStack align="start" spacing={2}>
                        <FormLabel fontWeight="medium">Item Type</FormLabel>
                        <Select 
                          placeholder="Select item type"
                          value={selectedItemType}
                          onChange={handleItemTypeChange}
                          bg={inputBg}
                        >
                          <option value="lost">Lost Items</option>
                          <option value="found">Found Items</option>
                        </Select>
                      </VStack>
                    </GridItem>

                    {/* Location Filter - Updated to use text input */}
                    <GridItem>
                      <VStack align="start" spacing={2}>
                        <FormLabel fontWeight="medium">Location</FormLabel>
                        <Input
                          placeholder="Type a location (e.g. Library, Room 101)"
                          value={selectedLocation}
                          onChange={handleLocationChange}
                          bg={inputBg}
                        />
                      </VStack>
                    </GridItem>

                    {/* Image Search */}
                    <GridItem>
                      <VStack align="start" spacing={2}>
                        <FormLabel fontWeight="medium">Image Search</FormLabel>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleImageSearch}
                        />
                        <Button 
                          leftIcon={<AttachmentIcon />} 
                          colorScheme="blue" 
                          onClick={triggerFileUpload}
                          width="full"
                        >
                          Upload Image
                        </Button>
                      </VStack>
                    </GridItem>

                    {/* Category Filter */}
                    <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                      <VStack align="start" spacing={2}>
                        <FormLabel fontWeight="medium">Categories</FormLabel>
                        <CheckboxGroup colorScheme="blue" value={selectedCategories}>
                          <Flex flexWrap="wrap" gap={4}>
                            {availableCategories.map((category) => (
                              <Checkbox 
                                key={category} 
                                value={category}
                                isChecked={selectedCategories.includes(category)}
                                onChange={handleCategoryChange}
                              >
                                {category}
                              </Checkbox>
                            ))}
                          </Flex>
                        </CheckboxGroup>
                      </VStack>
                    </GridItem>
                  </Grid>

                  {/* Filter Action Buttons */}
                  <HStack spacing={4} mt={6} justify="flex-end">
                    <Button variant="outline" onClick={handleClearFilters}>
                      Reset Filters
                    </Button>
                    <Button colorScheme="blue" onClick={applyFilters}>
                      Apply Filters
                    </Button>
                  </HStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            {/* Applied Filters Display */}
            {(selectedCategories.length > 0 || selectedItemType || selectedLocation || startDate || endDate) && (
              <Flex mt={2} flexWrap="wrap" gap={2} align="center">
                <Text fontWeight="bold" fontSize="sm">Applied Filters:</Text>
                
                {selectedCategories.map(cat => (
                  <Tag 
                    key={cat}
                    size="md" 
                    borderRadius="full" 
                    variant="subtle"
                    colorScheme="blue"
                  >
                    <TagLabel>{cat}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveCategory(cat)} />
                  </Tag>
                ))}
                
                {selectedItemType && (
                  <Tag 
                    size="md" 
                    borderRadius="full" 
                    variant="subtle"
                    colorScheme="green"
                  >
                    <TagLabel>{selectedItemType === "lost" ? "Lost Items" : "Found Items"}</TagLabel>
                    <TagCloseButton onClick={handleRemoveItemType} />
                  </Tag>
                )}
                
                {selectedLocation && (
                  <Tag 
                    size="md" 
                    borderRadius="full" 
                    variant="subtle"
                    colorScheme="purple"
                  >
                    <TagLabel>Location: {selectedLocation}</TagLabel>
                    <TagCloseButton onClick={handleRemoveLocation} />
                  </Tag>
                )}
                
                {startDate && (
                  <Tag 
                    size="md" 
                    borderRadius="full" 
                    variant="subtle"
                    colorScheme="orange"
                  >
                    <TagLabel>From: {startDate}</TagLabel>
                    <TagCloseButton onClick={() => setStartDate("")} />
                  </Tag>
                )}
                
                {endDate && (
                  <Tag 
                    size="md" 
                    borderRadius="full" 
                    variant="subtle"
                    colorScheme="orange"
                  >
                    <TagLabel>To: {endDate}</TagLabel>
                    <TagCloseButton onClick={() => setEndDate("")} />
                  </Tag>
                )}
                
                <Button 
                  size="xs" 
                  variant="link" 
                  colorScheme="red" 
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
              </Flex>
            )}
          </VStack>
        </Box>

        {/* Order information */}
        <Flex width="100%" justify="flex-start">
          <Text color="gray.500" fontStyle="italic" fontSize="sm">
            Items are displayed from newest to oldest
          </Text>
        </Flex>

        {/* Loading and Error States */}
        {isLoading && (
          <Text fontSize="xl" textAlign="center" color="blue.500">
            Loading items...
          </Text>
        )}
        
        {error && (
          <Text fontSize="xl" textAlign="center" color="red.500">
            Error: {error}
          </Text>
        )}

        {/* Render Items */}
        {!isLoading && !error && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
            {sortedFilteredItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </SimpleGrid>
        )}

        {/* Show No Items Found */}
        {!isLoading && !error && sortedFilteredItems.length === 0 && (
          <Text fontSize="xl" textAlign="center" fontWeight="bold" color="gray.500">
            No items found 😢
          </Text>
        )}
      </VStack>
    </Container>
  );
};

export default HomePage;
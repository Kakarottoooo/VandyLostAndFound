// Complete useItemStore.js with location search improvements
import { create } from 'zustand';

export const useItemStore = create((set, get) => ({
  // Regular items state
  items: [],
  searchQuery: '',
  startDate: '',
  endDate: '',
  isLoading: false,
  error: null,
  
  // New search filter states
  selectedCategories: [],
  selectedItemType: '',
  selectedLocation: '',
  availableCategories: [],

  // Followed items state
  followedItems: [],
  isLoadingFollowed: false,
  followedError: null,

  // Regular items functions
  fetchItems: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get current filter values from state
      const { 
        searchQuery, 
        startDate, 
        endDate, 
        selectedCategories,
        selectedItemType,
        selectedLocation
      } = get();
      
      // Build query params for advanced filtering
      const params = new URLSearchParams();
      
      if (searchQuery) params.append("search", searchQuery);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (selectedLocation) params.append("location", selectedLocation); // Changed from "building" to "location"
      if (selectedItemType) params.append("itemType", selectedItemType);
      
      // Handle multiple categories
      if (selectedCategories && selectedCategories.length > 0) {
        selectedCategories.forEach(category => {
          params.append("category", category);
        });
      }
      
      // Use relative URL with a timeout to avoid long waits if server is down
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(`/api/items?${params.toString()}`, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON');
      }
      
      const data = await res.json();
      
      if (data.success) {
        set({ items: data.data, isLoading: false });
      } else {
        throw new Error(data.message || 'Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch available categories
  fetchCategories: async () => {
    try {
      const response = await fetch('/api/items/categories');
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        set({ availableCategories: data.data });
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  },
  
  // Image similarity search
  searchByImage: async (imageFile) => {
    try {
      set({ isLoading: true, error: null });
      
      const formData = new FormData();
      formData.append("image", imageFile);
      
      const response = await fetch('/api/items/image-search', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        set({ items: data.data, isLoading: false });
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to search by image');
      }
    } catch (error) {
      console.error('Error searching by image:', error);
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // Delete an item (unchanged)
  deleteItem: async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Store current items for rollback if needed
      const currentItems = get().items;
      
      // Optimistically update UI by removing the item
      set({ 
        items: currentItems.filter(item => item._id !== itemId)
      });
      
      // Perform the API call
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        // Rollback to previous state if deletion failed
        set({ items: currentItems });
        throw new Error(data.message || 'Failed to delete item');
      }
      
      // Success - we've already updated the UI
      return { success: true };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { 
        success: false, 
        message: error.message || 'Error deleting item'
      };
    }
  },

  // Filter and search functions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  
  // New filter setters
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  setSelectedItemType: (itemType) => set({ selectedItemType: itemType }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  
  // Reset all filters
  clearFilters: () => set({ 
    searchQuery: '', 
    startDate: '', 
    endDate: '',
    selectedCategories: [],
    selectedItemType: '',
    selectedLocation: ''
  }),

  // Filter items (client-side filtering)
  // Note: This is a backup filtering mechanism. We primarily rely on server-side filtering.
  filteredItems: () => {
    const { 
      items, 
      searchQuery, 
      startDate, 
      endDate,
      selectedCategories,
      selectedItemType,
      selectedLocation 
    } = get();
    
    // Filter items first based on search criteria
    const filtered = items.filter((item) => {
      // Search query matching (name and description)
      const matchQuery = searchQuery
        ? (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      
      // Date filtering
      let itemDate;
      try {
        itemDate = new Date(item.dateFound || item.dateLost || item.createdAt);
      } catch (e) {
        return false;
      }
      
      const matchStart = startDate ? itemDate >= new Date(startDate) : true;
      const matchEnd = endDate ? itemDate <= new Date(endDate) : true;
      
      // Category filtering
      const matchCategory = selectedCategories.length > 0
        ? selectedCategories.includes(item.category)
        : true;
      
      // Item type filtering
      const matchType = selectedItemType
        ? item.itemType === selectedItemType
        : true;
      
      // Location filtering (fuzzy match)
      const matchLocation = selectedLocation
        ? (item.location && item.location.building && 
           item.location.building.toLowerCase().includes(selectedLocation.toLowerCase())) ||
          (item.location && item.location.room && 
           item.location.room.toLowerCase().includes(selectedLocation.toLowerCase())) ||
          (item.location && item.location.floor && 
           item.location.floor.toLowerCase().includes(selectedLocation.toLowerCase()))
        : true;
        
      return matchQuery && matchStart && matchEnd && matchCategory && matchType && matchLocation;
    });
    
    // Sort the filtered items by date (newest first)
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.dateFound || a.dateLost || a.createdAt || 0);
      const dateB = new Date(b.dateFound || b.dateLost || b.createdAt || 0);
      return dateB - dateA; // Sort in descending order (newest first)
    });
  },

  // Followed items functions (unchanged)
  fetchFollowedItems: async () => {
    try {
      set({ isLoadingFollowed: true, followedError: null });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('/api/users/followed-items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        set({ followedItems: data.data, isLoadingFollowed: false });
      } else {
        throw new Error(data.message || 'Failed to fetch followed items');
      }
    } catch (error) {
      console.error('Error fetching followed items:', error);
      set({ followedError: error.message, isLoadingFollowed: false });
    }
  },

  // Check if an item is followed (unchanged)
  isItemFollowed: (itemId) => {
    return get().followedItems.some(item => item._id === itemId);
  },

  // Follow an item (unchanged)
  followItem: async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Make API call to follow item
      const response = await fetch(`/api/users/follow/${itemId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Find the item in the items array
        const item = get().items.find(item => item._id === itemId);
        
        if (item) {
          // Add the item to the followed items list if it exists in our items array
          set(state => ({
            followedItems: [...state.followedItems, item]
          }));
        } else {
          // If the item is not in our items array, fetch it
          const itemResponse = await fetch(`/api/items/${itemId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (itemResponse.ok) {
            const itemData = await itemResponse.json();
            if (itemData.success) {
              // Add the item to the followed items list
              set(state => ({
                followedItems: [...state.followedItems, itemData.data]
              }));
            }
          } else {
            // If we can't get item details, just refetch all followed items
            await get().fetchFollowedItems();
          }
        }
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || 'Failed to follow item'
        };
      }
    } catch (error) {
      console.error('Error following item:', error);
      return { 
        success: false, 
        message: error.message || 'Error following item'
      };
    }
  },
  
  // Unfollow an item (unchanged)
  unfollowItem: async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Optimistically update UI by removing the item
      const currentFollowedItems = get().followedItems;
      set({ 
        followedItems: currentFollowedItems.filter(item => item._id !== itemId)
      });
      
      // Make API call to unfollow item
      const response = await fetch(`/api/users/follow/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        // Rollback to previous state if unfollow failed
        set({ followedItems: currentFollowedItems });
        throw new Error(data.message || 'Failed to unfollow item');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error unfollowing item:', error);
      return { 
        success: false, 
        message: error.message || 'Error unfollowing item'
      };
    }
  },
  
  // Toggle follow status (unchanged)
  toggleFollowStatus: async (itemId) => {
    const isFollowed = get().isItemFollowed(itemId);
    
    if (isFollowed) {
      return await get().unfollowItem(itemId);
    } else {
      return await get().followItem(itemId);
    }
  }
}));
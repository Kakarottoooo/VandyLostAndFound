// Updated useItemStore.js 
import { create } from 'zustand';

export const useItemStore = create((set, get) => ({
  items: [],
  searchQuery: '',
  startDate: '',
  endDate: '',
  isLoading: false,
  error: null,

  fetchItems: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Use relative URL with a timeout to avoid long waits if server is down
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch('/api/items', { 
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

  // New function to delete an item
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

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),

  filteredItems: () => {
    const { items, searchQuery, startDate, endDate } = get();
    
    // Filter items first based on search criteria
    const filtered = items.filter((item) => {
      // Search query matching
      const matchQuery = searchQuery
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      
      return matchQuery && matchStart && matchEnd;
    });
    
    // Sort the filtered items by date (newest first)
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.dateFound || a.dateLost || a.createdAt || 0);
      const dateB = new Date(b.dateFound || b.dateLost || b.createdAt || 0);
      return dateB - dateA; // Sort in descending order (newest first)
    });
  },
  
  clearFilters: () => set({ searchQuery: '', startDate: '', endDate: '' }),
}));
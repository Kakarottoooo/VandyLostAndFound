// Updated useItemStore.js
import create from 'zustand';

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
      
      // Use relative URL for API calls with Netlify proxy
      const res = await fetch('/api/items');
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
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

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),

  filteredItems: () => {
    const { items, searchQuery, startDate, endDate } = get();
    
    return items.filter((item) => {
      // Search query matching
      const matchQuery = searchQuery 
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      
      // Date filtering
      let itemDate;
      try {
        itemDate = new Date(item.dateFound);
      } catch (e) {
        return false;
      }
      
      const matchStart = startDate ? itemDate >= new Date(startDate) : true;
      const matchEnd = endDate ? itemDate <= new Date(endDate) : true;
      
      return matchQuery && matchStart && matchEnd;
    });
  },
  
  clearFilters: () => set({ searchQuery: '', startDate: '', endDate: '' }),
}));
import create from 'zustand';

export const useItemStore = create((set, get) => ({
  items: [],
  searchQuery: '',
  startDate: '',
  endDate: '',

  fetchItems: async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items`);
      const data = await res.json();
      if (res.ok && data.success) {
        set({ items: data.data });
      } else {
        console.error('Failed to fetch items:', data.message);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),

  filteredItems: () => {
    const { items, searchQuery, startDate, endDate } = get();
    return items.filter((item) => {
      const matchQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const itemDate = new Date(item.dateFound);
      const matchStart = startDate ? itemDate >= new Date(startDate) : true;
      const matchEnd = endDate ? itemDate <= new Date(endDate) : true;
      return matchQuery && matchStart && matchEnd;
    });
  },
}));

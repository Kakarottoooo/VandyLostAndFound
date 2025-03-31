// Updated AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userItems, setUserItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [globalItems, setGlobalItems] = useState([]);
  const navigate = useNavigate();

  // Get token from localStorage
  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    if (!token) {
      console.warn("No token provided to fetchUserProfile");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users/profile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Check for token expiration
      if (res.status === 401) {
        console.log("Auth token issue detected, logging out");
        handleLogout();
        return;
      }
      
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        // Only fetch items after user is set
        fetchUserItems(token, data.user.id);
      } else {
        console.error("Failed to fetch user profile:", data);
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const fetchUserItems = async (token, userId) => {
    if (!token) {
      token = getToken();
    }
    
    if (!userId && user) {
      userId = user.id;
    }
    
    if (!token || !userId) {
      console.warn("Cannot fetch user items: missing token or user ID");
      return;
    }
    
    setItemsLoading(true);
    
    try {
      // Use the dedicated endpoint for user items
      const res = await fetch('/api/users/items', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("User items response status:", res.status);
      
      const data = await res.json();
      console.log("User items response data:", data);
      
      if (res.ok && data.success) {
        setUserItems(data.data);
        
        // Update user object with items for convenience
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            createdItems: data.data
          };
        });
        
        console.log("User items updated:", data.data.length, "items");
      } else {
        console.error("Failed to fetch user items:", data);
        setUserItems([]);
      }
    } catch (error) {
      console.error('Error fetching user items:', error);
      setUserItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  // New function to fetch all items (for HomePage)
  const fetchAllItems = async () => {
    try {
      const res = await fetch('/api/items', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setGlobalItems(data.data);
        console.log("All items updated:", data.data.length, "items");
      } else {
        console.error("Failed to fetch all items:", data);
      }
    } catch (error) {
      console.error('Error fetching all items:', error);
    }
  };

  // Function to delete an item with proper global state update
  const deleteItem = async (itemId) => {
    const token = getToken();
    
    if (!token) {
      console.warn("Cannot delete item: no authentication token");
      return { success: false, message: "Authentication required" };
    }
    
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update local item states immediately
        setUserItems(prevItems => prevItems.filter(item => item._id !== itemId));
        setGlobalItems(prevItems => prevItems.filter(item => item._id !== itemId));
        
        // Also update user.createdItems if it exists
        setUser(prev => {
          if (!prev || !prev.createdItems) return prev;
          return {
            ...prev,
            createdItems: prev.createdItems.filter(item => item._id !== itemId)
          };
        });
        
        console.log("Item deleted successfully from all states:", itemId);
        return { success: true };
      } else {
        console.error("Failed to delete item:", data);
        return { success: false, message: data.message || "Failed to delete item" };
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, message: "Server error. Please try again." };
    }
  };

  // Define the login function
  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    fetchUserProfile(token);
    navigate('/profile');
  };

  // Define the logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setUserItems([]);
    navigate('/login');
  };

  const refreshUserItems = useCallback(() => {
    console.log("Refreshing user items");
    const token = getToken();
    const userId = user?.id;
    
    if (token && userId) {
      return fetchUserItems(token, userId);
    } else {
      console.warn("Cannot refresh items: missing token or user ID");
      return Promise.resolve(false);
    }
  }, [user, getToken]);

  // Comprehensive refresh function for all data in the app
  const refreshAllData = useCallback(async () => {
    console.log("Refreshing all application data");
    
    // Refresh user profile and items
    const token = getToken();
    if (token) {
      await fetchUserProfile(token);
    }
    
    // Refresh global items list
    await fetchAllItems();
    
    console.log("All data refreshed successfully");
    return true;
  }, [getToken]);

  return (
    <AuthContext.Provider value={{
      user,
      token: getToken(),
      login: handleLogin,
      logout: handleLogout,
      loading,
      userItems,
      itemsLoading,
      globalItems,
      refreshUserItems,
      refreshAllData,
      fetchAllItems,
      deleteItem, // Expose the delete function
      refetchUser: () => fetchUserProfile(getToken())
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
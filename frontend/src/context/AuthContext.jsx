// File: frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userItems, setUserItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      // Updated endpoint here:
      const res = await fetch('/api/users/profile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        if (data.user) {
          fetchUserItems(token);
        }
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      handleLogout();
    }
    setLoading(false);
  };

  const fetchUserItems = async (token) => {
    setItemsLoading(true);
    try {
      // Use the existing /api/items endpoint
      const res = await fetch('/api/items', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      const data = await res.json();
      
      if (res.ok && data.success && user) {
        // Filter items created by the current user
        const userItems = data.data.filter(item => 
          item.user && (
            item.user === user.id || 
            item.user._id === user.id || 
            (typeof item.user === 'object' && item.user._id === user.id)
          )
        );
        
        setUserItems(userItems);
        // Update user object with items for convenience
        setUser(prev => ({
          ...prev,
          createdItems: userItems
        }));
      }
    } catch (error) {
      console.error('Error fetching user items:', error);
    } finally {
      setItemsLoading(false);
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

  const refreshUserItems = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserItems(token);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login: handleLogin,  // Fixed: Use the defined handleLogin function
      logout: handleLogout, // Fixed: Use the defined handleLogout function
      loading,
      userItems,
      itemsLoading,
      refreshUserItems
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
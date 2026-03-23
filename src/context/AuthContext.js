import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // Get token from localStorage
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token || null;

  // Function to fetch user data using a token
  const getUser = async () => {
    if (token) {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      try {
        // Call the /api/users/profile endpoint
        const { data } = await axios.get(`https://eventro-backend.onrender.com/api/users/profile`, config);
        // Store user data *with* the token
        const userData = { ...data, token };
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
        console.log("AuthContext: getUser SUCCESS", userData);
      } catch (error) {
        console.error("AuthContext: Failed to fetch user", error);
        // Token might be invalid, so log out
        logout();
      }
    }
  };

  // Run on initial load
  useEffect(() => {
    console.log("AuthContext: Initial load, fetching user...");
    getUser();
  }, []); // Run only once on mount

  // Login function
  const login = (userData) => {
    console.log("AuthContext: login function called with:", userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData); // Set user state immediately
    // No need to call getUser() here, as userData is complete
  };

  // Logout function
  const logout = () => {
    console.log("AuthContext: logout function called");
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    // Provide the getUser function to the context
    <AuthContext.Provider value={{ user, login, logout, getUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
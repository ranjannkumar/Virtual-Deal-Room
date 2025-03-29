import React, { createContext, useState, useEffect } from "react";
import authService from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await authService.getUserProfile();
        setUser(profile);
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    };
    if (localStorage.getItem("token")) {
      fetchUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

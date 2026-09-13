import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('deakin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync user state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('deakin_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('deakin_user');
    }
  }, [currentUser]);

  // Login handler
  const login = (userData) => {
    setCurrentUser(userData);
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
  };

  // Upgrade user subscription tier in Firestore and local state
  const upgradeToPaid = async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, { subscriptionPlan: 'Paid' });
      setCurrentUser((prev) => ({ ...prev, subscriptionPlan: 'Paid' }));
    } catch (err) {
      console.error('Error upgrading plan:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, upgradeToPaid }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
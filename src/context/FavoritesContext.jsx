import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Logged In: Load from Firestore
        await loadFavoritesFromFirestore(user.uid);
      } else {
        // Guest: Load from LocalStorage
        const localFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];
        setFavorites(localFavs);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Load from Firestore
  const loadFavoritesFromFirestore = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().favorites) {
        setFavorites(docSnap.data().favorites);
      } else {
        // If no data in Firestore, maybe merge local favorites? 
        // For now, let's just start empty or keep local if needed.
        // Let's implement a simple "first login merge" if we wanted to be fancy,
        // but to keep it safe, let's just use what's in DB.
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error loading favorites from Firestore:", error);
    }
  };

  // 3. Toggle Favorite
  const toggleFavorite = async (product) => {
    // Standardize object structure
    const favItem = { 
        data: product.name, // Legacy field name compatibility
        image: product.image, 
        price: product.price 
    };

    // Check if already exists (safe check)
    const currentFavs = Array.isArray(favorites) ? favorites : [];
    const exists = currentFavs.some(f => f.data === favItem.data);
    let newFavorites;

    if (exists) {
      newFavorites = currentFavs.filter(f => f.data !== favItem.data);
    } else {
      newFavorites = [...currentFavs, favItem];
    }

    setFavorites(newFavorites);

    if (currentUser) {
      // Sync to Firestore
      try {
        const userRef = doc(db, "users", currentUser.uid);
        // We overwrite the array for simplicity (to handle removals easily)
        // or use arrayUnion/Remove if we want to be atomic. 
        // Since we filtered internally, setting the whole field is safe for this scale.
        await setDoc(userRef, { favorites: newFavorites }, { merge: true });
        
        // Optional: Also keep in local storage as cache? No, might confuse.
      } catch (error) {
        console.error("Error saving favorite to Firestore:", error);
      }
    } else {
      // Save to LocalStorage
      localStorage.setItem('favoritesItems', JSON.stringify(newFavorites));
    }
  };

  // 4. Check if item is favorite
  const isFavorite = (productName) => {
    return Array.isArray(favorites) ? favorites.some(f => f.data === productName) : false;
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading, currentUser }}>
      {children}
    </FavoritesContext.Provider>
  );
};

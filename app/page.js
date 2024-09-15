'use client'

import { useState, useEffect } from 'react';
import Palette from './components/Palette';
import { motion } from 'framer-motion';
import { db, auth } from './lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function Home() {
  const [palettes, setPalettes] = useState([]);
  const [currentPalette, setCurrentPalette] = useState({
    colors: Array(5).fill('#FFFFFF'),
    selectedStates: Array(5).fill(false),
    name: ''
  });
  const [activeColorIndex, setActiveColorIndex] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const logout = () => signOut(auth);

  const updateColor = (index, color) => {
    setCurrentPalette(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === index ? color : c),
      selectedStates: prev.selectedStates.map((s, i) => i === index ? true : s)
    }));
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setCurrentPalette(prev => ({ ...prev, name: newName }));
    console.log("Current palette name:", newName);
  };

  const loadPalettes = async () => {
    const palettesCollection = collection(db, 'palettes');
    const palettesQuery = query(palettesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(palettesQuery);
    const loadedPalettes = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      isOwner: auth.currentUser && doc.data().userId === auth.currentUser.uid
    }));
    setPalettes(loadedPalettes);
  };

  const savePalette = async () => {
    if (!isLoggedIn) {
      alert('Please log in to save a palette');
      return;
    }
    if (currentPalette.colors.some(color => color !== '#FFFFFF') && currentPalette.name.trim() !== '') {
      if (currentPalette.id) {
        // Editing existing palette
        try {
          const paletteRef = doc(db, 'palettes', currentPalette.id);
          const paletteSnap = await getDoc(paletteRef);
          
          if (paletteSnap.exists()) {
            await updateDoc(paletteRef, {
              colors: currentPalette.colors,
              selectedStates: currentPalette.selectedStates,
              name: currentPalette.name,
            });
          } else {
            console.error('Palette not found');
            alert('This palette no longer exists. It may have been deleted.');
          }
        } catch (error) {
          console.error('Error updating palette:', error);
          alert('An error occurred while updating the palette. Please try again.');
        }
      } else {
        // Creating new palette
        await addDoc(collection(db, 'palettes'), {
          ...currentPalette,
          createdAt: new Date(),
          userId: auth.currentUser.uid
        });
      }
      loadPalettes();
      setCurrentPalette({
        colors: Array(5).fill('#FFFFFF'),
        selectedStates: Array(5).fill(false),
        name: ''
      });
    }
  };

  const editPalette = async (paletteId, updatedPalette) => {
    if (!isLoggedIn) {
      alert('Please log in to edit a palette');
      return;
    }
    try {
      const paletteRef = doc(db, 'palettes', paletteId);
      const paletteSnap = await getDoc(paletteRef);
      
      if (paletteSnap.exists()) {
        await updateDoc(paletteRef, updatedPalette);
        loadPalettes();
        setCurrentPalette({
          colors: Array(5).fill('#FFFFFF'),
          selectedStates: Array(5).fill(false),
          name: ''
        });
      } else {
        console.error('Palette not found');
        alert('This palette no longer exists. It may have been deleted.');
        loadPalettes(); // Refresh the palette list
      }
    } catch (error) {
      console.error('Error updating palette:', error);
      alert('An error occurred while updating the palette. Please try again.');
    }
  };
  
  const deletePalette = async (paletteId) => {
    if (!isLoggedIn) {
      alert('Please log in to delete a palette');
      return;
    }
    await deleteDoc(doc(db, 'palettes', paletteId));
    loadPalettes();
  };

  const checkLoginStatus = () => {
    onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
  };
  
  const login = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message);
    }
  };

  const signup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
  
    loadPalettes();
  
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-white p-8 font-sans">
      <h1 className="text-2xl font-light text-gray-600 absolute top-8 left-8">
        Palette Party 🥳
      </h1>
      <div className="absolute top-8 right-8">
        {isLoggedIn ? (
          <button onClick={logout} className="text-gray-600 hover:text-gray-800 transition-colors">Logout</button>
        ) : (
          <form onSubmit={isSignUp ? signup : login} className="flex items-center space-x-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="p-2 border rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-500"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="p-2 border rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-500"
              required
            />
            <button type="submit" className="text-gray-600 hover:text-gray-800 transition-colors">
              {isSignUp ? 'Sign Up' : 'Login'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
      {isLoggedIn && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg w-full max-w-2xl mx-auto mt-20 mb-12 overflow-hidden relative"
        >
          <Palette 
            colors={currentPalette.colors} 
            selectedStates={currentPalette.selectedStates} 
            updateColor={updateColor}
            activeColorIndex={activeColorIndex}
            setActiveColorIndex={setActiveColorIndex}
          />
          <div className="p-6">
            <input
              type="text"
              value={currentPalette.name}
              onChange={handleNameChange}
              placeholder="Name your palette"
              className="w-full p-2 text-lg focus:outline-none text-center text-gray-700 placeholder-gray-400"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={savePalette}
            className="absolute bottom-4 right-4 bg-gray-300 text-gray-600 p-1.5 rounded-full shadow-md hover:bg-gray-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.button>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-24">
        {palettes.map((palette, index) => (
          <motion.div
            key={palette.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden relative"
          >
            <Palette 
              colors={palette.colors} 
              selectedStates={palette.selectedStates} 
              updateColor={() => {}} 
              activeColorIndex={null}
              setActiveColorIndex={() => {}}
              readOnly 
            />
            <div className="p-6">
              <h3 className="text-xl font-medium text-gray-700 text-center">{palette.name}</h3>
            </div>
            {palette.isOwner && (
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => setCurrentPalette({ ...palette, id: palette.id })}
                  className="bg-blue-500 text-white p-2 rounded-full"
                >
                  Edit
                </button>
                <button
                  onClick={() => deletePalette(palette.id)}
                  className="bg-red-500 text-white p-2 rounded-full"
                >
                  Delete
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </main>
  );
}
'use client'

import { useState } from 'react';
import Palette from './components/Palette';
import { motion } from 'framer-motion';

export default function Home() {
  const [palettes, setPalettes] = useState([]);
  const [currentPalette, setCurrentPalette] = useState({
    colors: Array(5).fill('#FFFFFF'),
    selectedStates: Array(5).fill(false),
    name: ''
  });

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

  const savePalette = () => {
    if (currentPalette.colors.every(color => color !== '#FFFFFF') && currentPalette.name.trim() !== '') {
      setPalettes([...palettes, currentPalette]);
      setCurrentPalette({
        colors: Array(5).fill('#FFFFFF'),
        selectedStates: Array(5).fill(false),
        name: ''
      });
    }
    //if the palette is incomplete, do nothing
  };

  return (
    <main className="min-h-screen bg-white p-8 font-sans">
      <h1 className="text-2xl font-light text-gray-600 absolute top-8 left-8">
        Palette Party 🥳
      </h1>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-2xl mx-auto mt-20 mb-12 overflow-hidden relative"
      >
        <Palette colors={currentPalette.colors} selectedStates={currentPalette.selectedStates} updateColor={updateColor} />
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
      
      <div className="w-full max-w-2xl mx-auto">
        {palettes.map((palette, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden"
          >
            <Palette colors={palette.colors} selectedStates={palette.selectedStates} updateColor={() => {}} readOnly />
            <div className="p-6">
              <h3 className="text-xl font-medium text-gray-700 text-center">{palette.name}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
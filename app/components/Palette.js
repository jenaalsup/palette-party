'use client'

import { motion } from 'framer-motion';

export default function Palette({ colors, selectedStates, updateColor, readOnly = false }) {
  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="flex h-64">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="flex-1 relative overflow-hidden cursor-pointer"
            style={{ backgroundColor: color }}
          >
            {!selectedStates[index] && !readOnly && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
            )}
            {!readOnly && (
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex mt-4">
        {colors.map((color, index) => (
          <div key={index} className="flex-1 text-center text-sm text-gray-600">
            {color.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}
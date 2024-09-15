'use client'

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

function HSVtoRGB(h, s, v) {
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function RGBtoHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export default function Palette({ colors, selectedStates, updateColor, activeColorIndex, setActiveColorIndex, readOnly = false }) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [value, setValue] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const pickerRef = useRef(null);
  const [localColors, setLocalColors] = useState(colors);

  useEffect(() => {
    setLocalColors(colors);
  }, [colors]);

  const handleHexChange = (e, index) => {
    const newValue = e.target.value;
    setLocalColors(prev => prev.map((c, i) => i === index ? newValue : c));

    let hex = newValue;
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      updateColor(index, hex.toUpperCase());
    }
  };


  const handleColorClick = (index) => {
    if (!readOnly) {
      setActiveColorIndex(activeColorIndex === index ? null : index);
    }
  };


  useEffect(() => {
    if (activeColorIndex !== null) {
      drawColorPicker();
    }
  }, [activeColorIndex, hue]);

  const drawColorPicker = () => {
    const canvas = pickerRef.current;
    if (!canvas) return;  // Add this check

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height - 20; // Subtract hue slider height
  
    // Draw saturation-value square
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const s = x / width;
        const v = 1 - y / height;
        const { r, g, b } = HSVtoRGB(hue, s, v);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  
    // Draw hue slider
    const hueGradient = ctx.createLinearGradient(0, height, width, height + 20);
    for (let i = 0; i <= 1; i += 1/6) {
      hueGradient.addColorStop(i, `hsl(${i * 360}, 100%, 50%)`);
    }
    ctx.fillStyle = hueGradient;
    ctx.fillRect(0, height, width, 20);
  };

  const handlePickerMouseDown = (e) => {
    setIsDragging(true);
    handlePickerMove(e);
  };

  const handlePickerMouseMove = (e) => {
    if (isDragging) {
      handlePickerMove(e);
    }
  };

  const handlePickerMouseUp = () => {
    setIsDragging(false);
  };

  const handlePickerMove = (e) => {
    const rect = pickerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height - 20; // Subtract hue slider height

    if (y <= height) {
      // In saturation-value square
      setSaturation(x / width);
      setValue(1 - y / height);
    } else {
      // In hue slider
      setHue(x / width);
    }

    updateColorFromHSV();
  };

  const updateColorFromHSV = () => {
    const { r, g, b } = HSVtoRGB(hue, saturation, value);
    const hex = RGBtoHex(r, g, b);
    updateColor(activeColorIndex, hex);
  };

  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="flex h-64">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="flex-1 relative overflow-hidden cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(index)}
          >
            {!selectedStates[index] && !readOnly && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
            )}
            {activeColorIndex === index && !readOnly && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center color-picker"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="rounded-lg shadow-lg" style={{ backgroundColor: color }}>
                  <div className="bg-white bg-opacity-95 rounded-lg">
                    <canvas 
                      ref={pickerRef}
                      width="150"
                      height="170"
                      className="cursor-crosshair"
                      onMouseDown={handlePickerMouseDown}
                      onMouseMove={handlePickerMouseMove}
                      onMouseUp={handlePickerMouseUp}
                      onMouseLeave={handlePickerMouseUp}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex mt-4">
        {localColors.map((color, index) => (
          <div key={index} className="flex-1 text-center text-sm text-gray-600">
            <input
              type="text"
              value={color}
              onChange={(e) => handleHexChange(e, index)}
              className="w-full text-center bg-transparent focus:outline-none text-gray-700"
              placeholder="#FFFFFF"
              maxLength={7}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
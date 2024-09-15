'use client'

export default function ColorPicker({ color, onColorChange }) {
  return (
    <input
      type="color"
      value={color}
      onChange={(e) => onColorChange(e.target.value)}
      className="w-full h-12 cursor-pointer rounded-md"
    />
  );
}
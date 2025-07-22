import React, { useState } from 'react';

interface DimensionInputsProps {
  height: number;
  width: number;
  shelfDepth: number;
  totalDepth: number;
  unit: 'inch' | 'cm';
  onHeightChange: (value: number) => void;
  onWidthChange: (value: number) => void;
  onShelfDepthChange: (value: number) => void;
  onTotalDepthChange: (value: number) => void;
  onUnitChange: (unit: 'inch' | 'cm') => void;
}

const DimensionInputs: React.FC<DimensionInputsProps> = ({
  height,
  width,
  shelfDepth,
  totalDepth,
  unit,
  onHeightChange,
  onWidthChange,
  onShelfDepthChange,
  onTotalDepthChange,
  onUnitChange,
}) => {
  const convertValue = (value: number, fromUnit: 'inch' | 'cm', toUnit: 'inch' | 'cm'): number => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'inch' && toUnit === 'cm') return value * 2.54;
    return value / 2.54;
  };

  const handleUnitToggle = () => {
    const newUnit = unit === 'inch' ? 'cm' : 'inch';
    onUnitChange(newUnit);
    
    // Convert all values
    onHeightChange(convertValue(height, unit, newUnit));
    onWidthChange(convertValue(width, unit, newUnit));
    onShelfDepthChange(convertValue(shelfDepth, unit, newUnit));
    onTotalDepthChange(convertValue(totalDepth, unit, newUnit));
  };

  const formatValue = (value: number): string => {
    if (unit === 'inch') {
      return `${value.toFixed(0)}"`;
    }
    return `${value.toFixed(0)}`;
  };

  return (
    <div className="bg-[#8BBBD9] rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#1E3A5F] font-semibold">Dimensions:</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUnitToggle}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              unit === 'inch' 
                ? 'bg-[#1E3A5F] text-white' 
                : 'bg-white/60 text-[#1E3A5F]'
            }`}
          >
            inch
          </button>
          <button
            onClick={handleUnitToggle}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              unit === 'cm' 
                ? 'bg-[#1E3A5F] text-white' 
                : 'bg-white/60 text-[#1E3A5F]'
            }`}
          >
            cm
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[#1E3A5F] font-medium">Height:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={unit === 'inch' ? height.toFixed(0) : height.toFixed(0)}
              onChange={(e) => onHeightChange(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 text-center text-[#1E3A5F] font-bold text-lg bg-transparent border-b-2 border-[#1E3A5F] focus:outline-none"
            />
            <span className="text-[#1E3A5F] font-medium">{unit === 'inch' ? '"' : 'cm'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#1E3A5F] font-medium">Width:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={unit === 'inch' ? width.toFixed(0) : width.toFixed(0)}
              onChange={(e) => onWidthChange(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 text-center text-[#1E3A5F] font-bold text-lg bg-transparent border-b-2 border-[#1E3A5F] focus:outline-none"
            />
            <span className="text-[#1E3A5F] font-medium">{unit === 'inch' ? '"' : 'cm'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#1E3A5F] font-medium">Depth:</span>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[#1E3A5F] text-sm">Total Depth:</span>
              <span className="text-[#1E3A5F] font-medium text-sm opacity-60">―――</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#1E3A5F] text-sm">Shelf Depth:</span>
              <input
                type="number"
                value={unit === 'inch' ? shelfDepth.toFixed(0) : shelfDepth.toFixed(0)}
                onChange={(e) => onShelfDepthChange(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-center text-[#1E3A5F] font-bold bg-transparent border-b-2 border-[#1E3A5F] focus:outline-none"
              />
              <span className="text-[#1E3A5F] font-medium">{unit === 'inch' ? '"' : 'cm'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionInputs; 
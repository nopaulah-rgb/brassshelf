/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useEffect } from 'react';

interface CrossbarSelectorProps {
  frontBars: boolean;
  onFrontBarsChange: (value: boolean) => void;
  shelfCount: number;
  selectedShelves: number[];
  onSelectedShelvesChange: (shelves: number[]) => void;
}

const CrossbarSelector: React.FC<CrossbarSelectorProps> = ({ 
  frontBars, 
  onFrontBarsChange,
  shelfCount,
  selectedShelves,
  onSelectedShelvesChange
}) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const handleShelfToggle = (shelfIndex: number) => {
    setIsUpdating(true);
    if (selectedShelves.includes(shelfIndex)) {
      onSelectedShelvesChange(selectedShelves.filter(index => index !== shelfIndex));
    } else {
      onSelectedShelvesChange([...selectedShelves, shelfIndex]);
    }
    // Reset updating state after a short delay
    setTimeout(() => setIsUpdating(false), 100);
  };

  const handleFrontBarsChange = (value: boolean) => {
    setIsUpdating(true);
    onFrontBarsChange(value);
    if (!value) {
      // If turning off front bars, clear all selected shelves
      onSelectedShelvesChange([]);
    }
    // Reset updating state after a short delay
    setTimeout(() => setIsUpdating(false), 100);
  };

  // Force re-render when shelfCount changes
  useEffect(() => {
    // Clear selected shelves if shelfCount is reduced
    if (selectedShelves.some(index => index >= shelfCount)) {
      onSelectedShelvesChange(selectedShelves.filter(index => index < shelfCount));
    }
  }, [shelfCount, selectedShelves, onSelectedShelvesChange]);

  return (
    <div className="space-y-4">
      {/* Front Horizontal Bars */}
      <div className="bg-[#8BBBD9] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-[#1E3A5F] font-medium">Front Horizontal Bars:</span>
          <button
            onClick={() => handleFrontBarsChange(!frontBars)}
            disabled={isUpdating}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              frontBars 
                ? 'bg-[#28A745] text-white' 
                : 'bg-[#DC3545] text-white'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUpdating ? '...' : (frontBars ? 'YES' : 'NO')}
          </button>
        </div>
        
        {/* Shelf Selection */}
        {frontBars && shelfCount > 0 && (
          <div className="mt-4 space-y-2">
            <span className="text-[#1E3A5F] text-sm font-medium">Select shelves for horizontal bars:</span>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: shelfCount }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handleShelfToggle(index)}
                  disabled={isUpdating}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedShelves.includes(index)
                      ? 'bg-[#28A745] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUpdating ? '...' : `Shelf ${index + 1}`}
                </button>
              ))}
            </div>
            {selectedShelves.length > 0 && (
              <p className="text-[#1E3A5F] text-xs mt-2">
                Selected: {selectedShelves.map(index => `Shelf ${index + 1}`).join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossbarSelector; 
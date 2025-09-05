/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useEffect } from 'react';

interface CrossbarSelectorProps {
  frontBars: boolean;
  onFrontBarsChange: (value: boolean) => void;
  backBars: boolean;
  onBackBarsChange: (value: boolean) => void;
  mountType?: string;
  shelfCount: number;
  selectedShelves: number[];
  onSelectedShelvesChange: (shelves: number[]) => void;
  selectedBackShelves: number[];
  onSelectedBackShelvesChange: (shelves: number[]) => void;
}

const CrossbarSelector: React.FC<CrossbarSelectorProps> = ({ 
  frontBars, 
  onFrontBarsChange,
  backBars,
  onBackBarsChange,
  mountType,
  shelfCount,
  selectedShelves,
  onSelectedShelvesChange,
  selectedBackShelves,
  onSelectedBackShelvesChange
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

  const handleBackShelfToggle = (shelfIndex: number) => {
    setIsUpdating(true);
    if (selectedBackShelves.includes(shelfIndex)) {
      onSelectedBackShelvesChange(selectedBackShelves.filter(index => index !== shelfIndex));
    } else {
      onSelectedBackShelvesChange([...selectedBackShelves, shelfIndex]);
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

  const handleBackBarsChange = (value: boolean) => {
    setIsUpdating(true);
    onBackBarsChange(value);
    if (!value) {
      // If turning off back bars, clear all selected shelves
      onSelectedBackShelvesChange([]);
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
    if (selectedBackShelves.some(index => index >= shelfCount)) {
      onSelectedBackShelvesChange(selectedBackShelves.filter(index => index < shelfCount));
    }
  }, [shelfCount, selectedShelves, onSelectedShelvesChange, selectedBackShelves, onSelectedBackShelvesChange]);

  const hideBackBars = !!mountType && mountType.toLowerCase().includes('wall');

  return (
    <div className="bg-white p-6 border border-gray-300 space-y-6">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Crossbar Options</h3>
      
      <div className="space-y-6">
        {/* Front Horizontal Bars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-medium">Front Horizontal Bars</span>
            <button
              onClick={() => handleFrontBarsChange(!frontBars)}
              disabled={isUpdating}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                frontBars 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {frontBars ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          
          {frontBars && (
            <div className="bg-white p-4 border border-gray-300">
              <p className="text-slate-600 text-sm mb-3">Select shelves for front bars:</p>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: shelfCount }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handleShelfToggle(index)}
                    disabled={isUpdating}
                    className={`w-10 h-10 text-sm font-medium transition-colors border ${
                               selectedShelves.includes(index)
                                 ? 'bg-black text-white border-black'
                                 : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                             }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back Horizontal Bars */}
        {!hideBackBars && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Back Horizontal Bars</span>
              <button
                onClick={() => handleBackBarsChange(!backBars)}
                disabled={isUpdating}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  backBars 
                    ? 'bg-black text-white' 
                    : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {backBars ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            
            {backBars && (
              <div className="bg-white p-4 border border-gray-300">
                <p className="text-slate-600 text-sm mb-3">Select shelves for back bars:</p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: shelfCount }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => handleBackShelfToggle(index)}
                      disabled={isUpdating}
                      className={`w-10 h-10 text-sm font-medium transition-colors border ${
                                 selectedBackShelves.includes(index)
                                   ? 'bg-black text-white border-black'
                                   : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                               }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossbarSelector; 
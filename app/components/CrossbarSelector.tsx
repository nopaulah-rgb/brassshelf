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
      // When selecting a shelf for front bars, remove it from back bars if it exists
      if (selectedBackShelves.includes(shelfIndex)) {
        onSelectedBackShelvesChange(selectedBackShelves.filter(index => index !== shelfIndex));
      }
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
      // When selecting a shelf for back bars, remove it from front bars if it exists
      if (selectedShelves.includes(shelfIndex)) {
        onSelectedShelvesChange(selectedShelves.filter(index => index !== shelfIndex));
      }
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
    <div>
      <div className="space-y-6">
        {/* Front Horizontal Bars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Front Horizontal Bars</span>
              <div className="tooltip-container relative flex items-center">
                <svg className="h-4 w-4 cursor-help text-gray-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" x2="12" y1="16" y2="12"></line>
                  <line x1="12" x2="12.01" y1="8" y2="8"></line>
                </svg>
                <div className="tooltip">Also known as crossbars, these add stability and a design element.</div>
              </div>
            </div>
            <button
              aria-checked={frontBars}
              className={`toggle-switch ${frontBars ? 'on' : ''}`}
              id="front-bars-toggle"
              role="switch"
              type="button"
              onClick={() => handleFrontBarsChange(!frontBars)}
              disabled={isUpdating}
            >
              <span className="toggle-switch-knob"></span>
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
                                 : selectedBackShelves.includes(index)
                                 ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                                 : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                             }`}
                    title={selectedBackShelves.includes(index) ? 'This shelf is selected for back bars' : ''}
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
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Back Horizontal Bars</span>
                <div className="tooltip-container relative flex items-center">
                  <svg className="h-4 w-4 cursor-help text-gray-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" x2="12" y1="16" y2="12"></line>
                    <line x1="12" x2="12.01" y1="8" y2="8"></line>
                  </svg>
                  <div className="tooltip">Also known as crossbars, these add stability and a design element.</div>
                </div>
              </div>
              <button
                aria-checked={backBars}
                className={`toggle-switch ${backBars ? 'on' : ''}`}
                id="back-bars-toggle"
                role="switch"
                type="button"
                onClick={() => handleBackBarsChange(!backBars)}
                disabled={isUpdating}
              >
                <span className="toggle-switch-knob"></span>
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
                                   : selectedShelves.includes(index)
                                   ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                                   : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                               }`}
                      title={selectedShelves.includes(index) ? 'This shelf is selected for front bars' : ''}
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
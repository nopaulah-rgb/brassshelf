/* eslint-disable jsx-a11y/label-has-associated-control */

import React from 'react';

interface CrossbarSelectorProps {
  frontBars: boolean;
  onFrontBarsChange: (value: boolean) => void;
}

const CrossbarSelector: React.FC<CrossbarSelectorProps> = ({ 
  frontBars, 
  onFrontBarsChange
}) => {
  return (
    <div className="space-y-4">
      {/* Front Horizontal Bars */}
      <div className="bg-[#8BBBD9] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-[#1E3A5F] font-medium">Front Horizontal Bars:</span>
          <button
            onClick={() => onFrontBarsChange(!frontBars)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              frontBars 
                ? 'bg-[#28A745] text-white' 
                : 'bg-[#DC3545] text-white'
            }`}
          >
            {frontBars ? 'YES' : 'NO'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrossbarSelector; 
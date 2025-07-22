import React from 'react';

interface AdjustSpacesSelectorProps {
  adjustShelfSpaces: boolean;
  adjustBaySpaces: boolean;
  verticalBarsAtBack: boolean;
  putShelvesOnFittings: boolean;
  putShelvesBetweenFittings: boolean;
  onAdjustShelfSpacesChange: (value: boolean) => void;
  onAdjustBaySpacesChange: (value: boolean) => void;
  onVerticalBarsChange: (value: boolean) => void;
  onShelvesOnFittingsChange: (value: boolean) => void;
  onShelvesBetweenFittingsChange: (value: boolean) => void;
}

const AdjustSpacesSelector: React.FC<AdjustSpacesSelectorProps> = ({
  adjustShelfSpaces,
  adjustBaySpaces,
  verticalBarsAtBack,
  putShelvesOnFittings,
  putShelvesBetweenFittings,
  onAdjustShelfSpacesChange,
  onAdjustBaySpacesChange,
  onVerticalBarsChange,
  onShelvesOnFittingsChange,
  onShelvesBetweenFittingsChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Adjust Shelf Spaces */}
      <div className="bg-[#8BBBD9] rounded-lg p-4">
        <h3 className="text-[#1E3A5F] font-semibold mb-3">Adjust Shelf Spaces:</h3>
        <button
          onClick={() => onAdjustShelfSpacesChange(!adjustShelfSpaces)}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
            adjustShelfSpaces
              ? 'bg-[#1E3A5F] text-white'
              : 'bg-white/60 text-[#1E3A5F] border border-[#1E3A5F]/20'
          }`}
        >
          {adjustShelfSpaces ? 'Custom Spacing Enabled' : 'Equal Spacing'}
        </button>
      </div>

      {/* Adjust Bay Spaces */}
      <div className="bg-[#8BBBD9] rounded-lg p-4">
        <h3 className="text-[#1E3A5F] font-semibold mb-3">Adjust Bay Spaces:</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[#1E3A5F]">Vertical Bars at the Back</span>
            <button
              onClick={() => onVerticalBarsChange(!verticalBarsAtBack)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                verticalBarsAtBack
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-white/60 text-[#1E3A5F] border border-[#1E3A5F]/20'
              }`}
            >
              {verticalBarsAtBack ? 'Yes' : 'No'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[#1E3A5F]">No Vertical Bars at the Back</span>
            <button
              onClick={() => onVerticalBarsChange(false)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                !verticalBarsAtBack
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-white/60 text-[#1E3A5F] border border-[#1E3A5F]/20'
              }`}
            >
              {!verticalBarsAtBack ? 'Selected' : 'No'}
            </button>
          </div>
        </div>
      </div>

      {/* Shelf Placement Options */}
      <div className="bg-[#8BBBD9] rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[#1E3A5F]">Put Shelves on Fittings</span>
            <button
              onClick={() => onShelvesOnFittingsChange(!putShelvesOnFittings)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                putShelvesOnFittings
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-white/60 text-[#1E3A5F] border border-[#1E3A5F]/20'
              }`}
            >
              {putShelvesOnFittings ? 'Yes' : 'No'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[#1E3A5F]">Put Shelves Between Fittings</span>
            <button
              onClick={() => onShelvesBetweenFittingsChange(!putShelvesBetweenFittings)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                putShelvesBetweenFittings
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-white/60 text-[#1E3A5F] border border-[#1E3A5F]/20'
              }`}
            >
              {putShelvesBetweenFittings ? 'Yes' : 'No'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustSpacesSelector; 
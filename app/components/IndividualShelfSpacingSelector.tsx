import React, { useState, useEffect } from 'react';

interface IndividualShelfSpacingSelectorProps {
  shelfQuantity: number;
  onSpacingChange: (spacings: number[]) => void;
  defaultSpacing?: number;
}

const IndividualShelfSpacingSelector: React.FC<IndividualShelfSpacingSelectorProps> = ({
  shelfQuantity,
  onSpacingChange,
  defaultSpacing = 250
}) => {
  const [unit, setUnit] = useState<'inch' | 'cm'>('inch');
  const [individualSpacings, setIndividualSpacings] = useState<number[]>([defaultSpacing]);

  // Convert to mm for internal use
  const convertToMm = (value: number, unit: 'inch' | 'cm'): number => {
    if (unit === 'inch') {
      return value * 25.4; // 1 inch = 25.4 mm
    } else {
      return value * 10; // 1 cm = 10 mm
    }
  };

  // Convert from mm to display unit
  const convertFromMm = (value: number, unit: 'inch' | 'cm'): number => {
    if (unit === 'inch') {
      return value / 25.4;
    } else {
      return value / 10;
    }
  };

  // Initialize spacings when shelf quantity changes
  useEffect(() => {
    if (shelfQuantity > 0) {
      const initialSpacings = Array(shelfQuantity).fill(defaultSpacing);
      setIndividualSpacings(initialSpacings);
      // Yeni shelf quantity için parent'a bildir
      onSpacingChange(initialSpacings);
    }
  }, [shelfQuantity, defaultSpacing, onSpacingChange]);

  // Handle unit change
  const handleUnitChange = (newUnit: 'inch' | 'cm') => {
    setUnit(newUnit);
    // Convert all existing values to new unit
    const convertedSpacings = individualSpacings.map(spacing => {
      const displayValue = convertFromMm(spacing, unit);
      return convertToMm(displayValue, newUnit);
    });
    setIndividualSpacings(convertedSpacings);
    onSpacingChange(convertedSpacings);
  };

  // Handle individual spacing change
  const handleSpacingChange = (index: number, value: number) => {
    if (value > 0) {
      const spacingInMm = convertToMm(value, unit);
      const newSpacings = [...individualSpacings];
      newSpacings[index] = spacingInMm;
      setIndividualSpacings(newSpacings);
      console.log('Individual spacing changed:', { index, value, spacingInMm, newSpacings });
      onSpacingChange(newSpacings);
    }
  };

  // Handle bulk spacing change (set all to same value)
  const handleBulkSpacingChange = (value: number) => {
    if (value > 0) {
      const spacingInMm = convertToMm(value, unit);
      const newSpacings = Array(shelfQuantity).fill(spacingInMm);
      setIndividualSpacings(newSpacings);
      onSpacingChange(newSpacings);
    }
  };

  return (
    <div className="bg-[#8BBBD9] rounded-lg p-4">
      <h3 className="text-[#1E3A5F] font-semibold mb-3">Individual Shelf Spacing:</h3>
      
      {/* Unit Toggle */}
      <div className="flex border-2 border-[#1E3A5F]/20 rounded-lg overflow-hidden mb-4">
        <button
          onClick={() => handleUnitChange('inch')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            unit === 'inch'
              ? 'bg-[#1E3A5F] text-white'
              : 'bg-white/60 text-[#1E3A5F] hover:bg-white/80'
          }`}
        >
          inch
        </button>
        <button
          onClick={() => handleUnitChange('cm')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            unit === 'cm'
              ? 'bg-[#1E3A5F] text-white'
              : 'bg-white/60 text-[#1E3A5F] hover:bg-white/80'
          }`}
        >
          cm
        </button>
      </div>

      {/* Bulk Spacing Control */}
      <div className="mb-4">
        <div className="block text-sm font-medium text-[#1E3A5F] mb-2">
          Set All Shelves to Same Spacing:
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            min={unit === 'inch' ? "6" : "15.24"}
            max={unit === 'inch' ? "20" : "50.8"}
            step={unit === 'inch' ? "0.5" : "0.5"}
            placeholder={unit === 'inch' ? "12" : "30.48"}
            className="flex-1 py-2 px-3 border-2 border-[#1E3A5F]/20 rounded-lg 
                     text-[#1E3A5F] bg-white/80 focus:border-[#1E3A5F] 
                     focus:outline-none text-center font-medium transition-all duration-200"
            onChange={(e) => {
              const value = Number(e.target.value);
              console.log('Bulk input change:', { value });
              if (value > 0) {
                handleBulkSpacingChange(value);
              }
            }}
          />
          <span className="py-2 px-3 text-[#1E3A5F] font-medium">
            {unit}
          </span>
        </div>
      </div>

      {/* Individual Shelf Spacing Controls */}
      <div className="space-y-3">
        <div className="block text-sm font-medium text-[#1E3A5F]">
          Individual Shelf Spacing:
        </div>
        {individualSpacings && individualSpacings.length > 0 && individualSpacings.map((spacing, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#1E3A5F] min-w-[80px]">
              Shelf {index + 1}:
            </span>
                        <input
              type="number"
              value={convertFromMm(spacing, unit).toFixed(1)}
              min={unit === 'inch' ? "6" : "15.24"}
              max={unit === 'inch' ? "20" : "50.8"}
              step={unit === 'inch' ? "0.5" : "0.5"}
              className="flex-1 py-2 px-3 border-2 border-[#1E3A5F]/20 rounded-lg 
                       text-[#1E3A5F] bg-white/80 focus:border-[#1E3A5F] 
                       focus:outline-none text-center font-medium transition-all duration-200"
              onChange={(e) => {
                const value = Number(e.target.value);
                console.log('Input change:', { index, value });
                if (value > 0) {
                  handleSpacingChange(index, value);
                }
              }}
            />
            <span className="text-sm text-[#1E3A5F] font-medium min-w-[30px]">
              {unit}
            </span>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-white/60 rounded-lg">
        <p className="text-xs text-[#1E3A5F]/70">
          <strong>Instructions:</strong>
          <br />
          • Use the bulk control to set all shelves to the same spacing
          <br />
          • Use individual controls to set different spacing for each shelf
          <br />
          • Recommended range: {unit === 'inch' ? '6-20 inch' : '15.24-50.8 cm'}
          <br />
          • Spacing determines the distance between shelves and rip length
        </p>
      </div>
    </div>
  );
};

export default IndividualShelfSpacingSelector; 
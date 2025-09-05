import React, { useState, useEffect, useCallback } from 'react';

interface BaySpacingInputProps {
  baySpacings: number[]; // Individual bay spacings in mm
  onBaySpacingsChange: (spacings: number[]) => void;
  barCount: number;
  totalWidth: number; // Total width in the current unit
  unit: 'inch' | 'mm'; // Current unit from parent
}

type Unit = 'mm' | 'inch';

const BaySpacingInput: React.FC<BaySpacingInputProps> = ({ 
  baySpacings, 
  onBaySpacingsChange,
  barCount,
  totalWidth,
  unit: parentUnit
}) => {
  const [unit, setUnit] = useState<Unit>('mm');
  const [firstBaySpacing, setFirstBaySpacing] = useState<number>(0);

  // Convert parent unit to mm for calculations
  const totalWidthMm = parentUnit === 'inch' ? totalWidth * 25.4 : totalWidth;
  
  // Constants for calculations (2" protrusion on each side = 4" total = 101.6mm)
  const protrusionsMm = 2 * 25.4 * 2; // 2 inches on each side converted to mm

  // Calculate remaining bays and their spacing
  const calculateBaySpacings = useCallback((firstSpacingMm: number) => {
    if (barCount <= 1) return [];
    
    const spaceBetweenBays = barCount - 1; // Number of gaps between bays
    if (spaceBetweenBays <= 0) return [];
    
    // Available space for bay spacings = total width - protrusions - first bay spacing
    const availableSpace = totalWidthMm - protrusionsMm - firstSpacingMm;
    const remainingBays = spaceBetweenBays - 1; // Excluding the first bay
    
    if (remainingBays <= 0) {
      return [firstSpacingMm];
    }
    
    // Distribute remaining space equally among remaining bays
    const remainingSpacingPerBay = Math.max(0, availableSpace / remainingBays);
    
    const spacings = [firstSpacingMm];
    for (let i = 0; i < remainingBays; i++) {
      spacings.push(remainingSpacingPerBay);
    }
    
    return spacings;
  }, [barCount, totalWidthMm, protrusionsMm]);

  // Initialize first bay spacing from existing baySpacings
  useEffect(() => {
    if (baySpacings.length > 0) {
      setFirstBaySpacing(baySpacings[0]);
    }
  }, [baySpacings]);

  // Update display value based on unit changes
  useEffect(() => {
    // Don't auto-update if user hasn't set a value yet
    if (firstBaySpacing === 0) return;
    
    const newSpacings = calculateBaySpacings(firstBaySpacing);
    onBaySpacingsChange(newSpacings);
  }, [firstBaySpacing, calculateBaySpacings, onBaySpacingsChange]);

  const handleUnitChange = (newUnit: Unit) => {
    if (newUnit === unit) return;
    
    if (newUnit === 'inch') {
      // mm to inch
      const inchValue = Math.round((firstBaySpacing / 25.4) * 100) / 100;
      setFirstBaySpacing(inchValue * 25.4); // Keep internal state in mm
    } else {
      // inch to mm - firstBaySpacing is already in mm internally
      // No conversion needed for internal state
    }
    
    setUnit(newUnit);
  };

  const handleFirstBayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      let valueInMm = value;
      
      // Convert to mm if input is in inches
      if (unit === 'inch') {
        valueInMm = value * 25.4;
      }
      
      setFirstBaySpacing(valueInMm);
    }
  };

  const getDisplayValue = (valueInMm: number) => {
    if (unit === 'inch') {
      return Math.round((valueInMm / 25.4) * 100) / 100;
    }
    return Math.round(valueInMm);
  };

  const getMaxValue = () => {
    const maxAvailableSpace = totalWidthMm - protrusionsMm;
    if (unit === 'inch') {
      return Math.round((maxAvailableSpace / 25.4) * 100) / 100;
    }
    return Math.round(maxAvailableSpace);
  };

  const getStepValue = () => {
    return unit === 'inch' ? 0.1 : 1;
  };

  // Calculate remaining space for display
  const remainingSpace = Math.max(0, totalWidthMm - protrusionsMm - firstBaySpacing);
  const remainingBays = Math.max(0, barCount - 2); // Excluding first bay and protrusions
  const spacingPerRemainingBay = remainingBays > 0 ? remainingSpace / remainingBays : 0;

  // Don't show if only one bay
  if (barCount <= 1) {
    return null;
  }

  return (
    <div className="bg-white p-6 border border-gray-300">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Bay Spacing Calculator</h3>
      
      {/* Unit Selector */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => handleUnitChange('mm')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            unit === 'mm' 
              ? 'bg-black text-white' 
              : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
          }`}
        >
          mm
        </button>
        <button
          onClick={() => handleUnitChange('inch')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            unit === 'inch' 
              ? 'bg-black text-white' 
              : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
          }`}
        >
          inch
        </button>
      </div>

      {/* First Bay Spacing Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          First Bay Spacing
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={getDisplayValue(firstBaySpacing)}
            onChange={handleFirstBayChange}
            min="0"
            max={getMaxValue()}
            step={getStepValue()}
            className="w-32 px-4 py-3 border border-gray-300 bg-white text-gray-800 font-medium focus:outline-none focus:border-black transition-colors"
            placeholder="Enter spacing"
          />
          <span className="text-slate-700 text-sm font-medium">{unit}</span>
        </div>
      </div>

      {/* Calculation Summary */}
      <div className="bg-white p-4 border border-gray-300">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Spacing Breakdown</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Total Width:</span>
            <span className="font-medium">{getDisplayValue(totalWidthMm)}{unit}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-600">Side Protrusions (2" each):</span>
            <span className="font-medium">-{getDisplayValue(protrusionsMm)}{unit}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-600">First Bay Spacing:</span>
            <span className="font-medium">-{getDisplayValue(firstBaySpacing)}{unit}</span>
          </div>
          
          <hr className="border-slate-200" />
          
          <div className="flex justify-between">
            <span className="text-slate-600">Remaining Space:</span>
            <span className="font-medium">{getDisplayValue(remainingSpace)}{unit}</span>
          </div>
          
          {remainingBays > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Per Remaining Bay ({remainingBays}):</span>
              <span className="font-medium text-green-600">{getDisplayValue(spacingPerRemainingBay)}{unit}</span>
            </div>
          )}
        </div>

        {/* Individual Bay Spacings Display */}
        {baySpacings.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-300">
            <h5 className="text-xs font-semibold text-slate-700 mb-2">All Bay Spacings:</h5>
            <div className="flex flex-wrap gap-2">
              {baySpacings.map((spacing, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium"
                >
                  Bay {index + 1}: {getDisplayValue(spacing)}{unit}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Warning if spacing is too small */}
      {spacingPerRemainingBay < (unit === 'inch' ? 1 : 25.4) && remainingBays > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            ⚠️ Warning: Remaining bay spacing is very small. Consider reducing the first bay spacing or total width.
          </p>
        </div>
      )}
    </div>
  );
};

export default BaySpacingInput;
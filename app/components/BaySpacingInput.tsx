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
  const [individualSpacings, setIndividualSpacings] = useState<number[]>([]);
  const [displayValues, setDisplayValues] = useState<string[]>([]);

  // Convert parent unit to mm for calculations
  const totalWidthMm = parentUnit === 'inch' ? totalWidth * 25.4 : totalWidth;
  
  // Constants for calculations (2" protrusion on each side = 4" total = 101.6mm)
  const protrusionsMm = 2 * 25.4 * 2; // 2 inches on each side converted to mm

  // Helper functions for unit conversion
  const convertToMm = (value: number, fromUnit: Unit): number => {
    if (fromUnit === 'inch') {
      return Math.round(value * 25.4);
    }
    return Math.round(value);
  };

  const convertFromMm = (value: number, toUnit: Unit): number => {
    if (toUnit === 'inch') {
      return Math.round((value / 25.4) * 100) / 100;
    }
    return value;
  };

  // Calculate number of bay spacings needed
  const numberOfBaySpacings = Math.max(0, barCount - 1);

  // Initialize individual spacings when barCount changes
  useEffect(() => {
    if (numberOfBaySpacings > 0) {
      // If we have existing baySpacings, use them
      if (baySpacings.length === numberOfBaySpacings) {
        setIndividualSpacings([...baySpacings]);
        const initialDisplayValues = baySpacings.map(spacing => 
          convertFromMm(spacing, unit).toString()
        );
        setDisplayValues(initialDisplayValues);
      } else {
        // Initialize with default values (e.g., 100mm or ~4 inches)
        const defaultSpacingMm = 100;
        const initialSpacings = Array(numberOfBaySpacings).fill(defaultSpacingMm);
        setIndividualSpacings(initialSpacings);
        const initialDisplayValues = initialSpacings.map(spacing => 
          convertFromMm(spacing, unit).toString()
        );
        setDisplayValues(initialDisplayValues);
        onBaySpacingsChange([...initialSpacings]);
      }
    } else {
      setIndividualSpacings([]);
      setDisplayValues([]);
      onBaySpacingsChange([]);
    }
  }, [numberOfBaySpacings, unit]); // Remove baySpacings from dependencies to prevent loops

  // Update parent when individual spacings change
  useEffect(() => {
    if (individualSpacings.length > 0 && individualSpacings.length === numberOfBaySpacings) {
      onBaySpacingsChange([...individualSpacings]);
    }
  }, [individualSpacings, onBaySpacingsChange, numberOfBaySpacings]);

  const handleUnitChange = (newUnit: Unit) => {
    if (newUnit === unit) return;
    
    setUnit(newUnit);
    // Update display values for new unit
    const newDisplayValues = individualSpacings.map(spacing => 
      convertFromMm(spacing, newUnit).toString()
    );
    setDisplayValues(newDisplayValues);
  };

  const handleSpacingChange = (index: number, value: string) => {
    // Update display values immediately for better UX
    const newDisplayValues = [...displayValues];
    newDisplayValues[index] = value;
    setDisplayValues(newDisplayValues);
    
    // Only validate and update internal state for valid numbers
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      const spacingInMm = convertToMm(numValue, unit);
      const newSpacings = [...individualSpacings];
      newSpacings[index] = spacingInMm;
      setIndividualSpacings(newSpacings);
    }
  };

  const getStepValue = () => {
    return unit === 'inch' ? 0.1 : 1;
  };

  // Calculate total spacing used and remaining space
  const totalSpacingUsed = individualSpacings.reduce((sum, spacing) => sum + spacing, 0);
  const availableSpace = totalWidthMm - protrusionsMm;
  const remainingSpace = Math.max(0, availableSpace - totalSpacingUsed);

  // Don't show if only one bay
  if (barCount <= 1) {
    return null;
  }

  return (
    <div className="bg-white p-6 border border-gray-300">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Individual Bay Spacing</h3>
      
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

      {/* Individual Bay Spacing Inputs */}
      <div className="space-y-3 mb-4">
        {Array.from({ length: numberOfBaySpacings }, (_, index) => (
          <div key={index} className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 w-24">
              Bay {index + 1}:
            </label>
            <input
              type="number"
              value={displayValues[index] || ''}
              onChange={(e) => handleSpacingChange(index, e.target.value)}
              min="0"
              step={getStepValue()}
              className="flex-1 py-2 px-3 border border-gray-300 bg-white text-gray-800 font-medium focus:outline-none focus:border-black transition-colors"
              placeholder={unit === 'inch' ? "4" : "100"}
            />
            <span className="text-sm text-slate-600 w-12">{unit}</span>
          </div>
        ))}
      </div>

      {/* Spacing Summary */}
      <div className="bg-white p-4 border border-gray-300">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Spacing Summary</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Total Width:</span>
            <span className="font-medium">{convertFromMm(totalWidthMm, unit)}{unit}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-600">Side Protrusions (2" each):</span>
            <span className="font-medium">-{convertFromMm(protrusionsMm, unit)}{unit}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-600">Available Space:</span>
            <span className="font-medium">{convertFromMm(availableSpace, unit)}{unit}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-600">Total Spacing Used:</span>
            <span className="font-medium">-{convertFromMm(totalSpacingUsed, unit)}{unit}</span>
          </div>
          
          <hr className="border-slate-200" />
          
          <div className="flex justify-between">
            <span className="text-slate-600">Remaining Space:</span>
            <span className={`font-medium ${remainingSpace < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {convertFromMm(remainingSpace, unit)}{unit}
            </span>
          </div>
        </div>
      </div>

      {/* Warning if total spacing exceeds available space */}
      {remainingSpace < 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200">
          <p className="text-red-800 text-sm">
            ⚠️ Warning: Total bay spacing exceeds available space. Please reduce spacing values.
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 bg-white p-4 border border-gray-300">
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-medium">Note:</span> Each bay can have different spacing for custom layouts.
          Adjust individual bay spacings to fit your design requirements.
        </p>
      </div>
    </div>
  );
};

export default BaySpacingInput;
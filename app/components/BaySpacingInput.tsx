import React, { useState, useEffect } from 'react';

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
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [isValidationOpen, setIsValidationOpen] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [invalidIndex, setInvalidIndex] = useState<number>(-1);

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
        const initialInputValues = baySpacings.map(spacing => 
          convertFromMm(spacing, unit).toFixed(1)
        );
        setInputValues(initialInputValues);
      } else {
        // Initialize with default values (0mm for connected bays by default)
        const defaultSpacingMm = 0;
        const initialSpacings = Array(numberOfBaySpacings).fill(defaultSpacingMm);
        setIndividualSpacings(initialSpacings);
        const initialInputValues = initialSpacings.map(spacing => 
          convertFromMm(spacing, unit).toFixed(1)
        );
        setInputValues(initialInputValues);
        onBaySpacingsChange([...initialSpacings]);
      }
    } else {
      setIndividualSpacings([]);
      setInputValues([]);
      onBaySpacingsChange([]);
    }
  }, [numberOfBaySpacings, unit]); // Remove baySpacings and onBaySpacingsChange from dependencies

  // Update parent when individual spacings change
  useEffect(() => {
    if (individualSpacings.length > 0 && individualSpacings.length === numberOfBaySpacings) {
      onBaySpacingsChange([...individualSpacings]);
    }
  }, [individualSpacings, onBaySpacingsChange, numberOfBaySpacings]);

  const handleUnitChange = (newUnit: Unit) => {
    if (newUnit === unit) return;
    
    setUnit(newUnit);
    // Update input values for new unit
    const newInputValues = individualSpacings.map(spacing => 
      convertFromMm(spacing, newUnit).toFixed(1)
    );
    setInputValues(newInputValues);
  };

  const handleSpacingChange = (index: number, value: string) => {
    console.log('handleSpacingChange called:', { index, value, currentInputValues: inputValues });
    
    // Allow decimal input with up to 3 decimal places
    if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
      // Update input values immediately for better UX
      const newInputValues = [...inputValues];
      newInputValues[index] = value;
      setInputValues(newInputValues);
      
      // Only validate and update internal state for valid numbers
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        // Clear any previous validation errors for this index
        if (invalidIndex === index) {
          setInvalidIndex(-1);
          setIsValidationOpen(false);
        }
        
        const spacingInMm = convertToMm(numValue, unit);
        const newSpacings = [...individualSpacings];
        newSpacings[index] = spacingInMm;
        setIndividualSpacings(newSpacings);
        
        console.log('Bay spacing changed:', { index, value, spacingInMm, newSpacings });
      } else if (value === '') {
        // Allow empty values for better UX
        console.log('Empty value entered for bay index:', index);
      }
    }
  };


  // Handle blur event for validation
  const handleBlur = (index: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      // Check if value is within reasonable range (0.1 to 1000 in current unit)
      const minValue = unit === 'inch' ? 0.1 : 2.5; // ~0.1" or ~2.5mm
      const maxValue = unit === 'inch' ? 1000 : 25400; // ~1000" or ~25400mm
      
      if (numValue < minValue || numValue > maxValue) {
        const currentValue = unit === 'inch' ? `${numValue}"` : `${Math.round(numValue)}mm`;
        setValidationMessage(`Bay ${index + 1} spacing must be between ${minValue}${unit} and ${maxValue}${unit}. Current value: ${currentValue}`);
        setInvalidIndex(index);
        setIsValidationOpen(true);
      }
    } else if (value !== '' && (isNaN(numValue) || numValue <= 0)) {
      // Show validation error for invalid non-empty values
      setValidationMessage(`Bay ${index + 1}: Please enter a valid positive number (e.g., ${unit === 'inch' ? '4.5' : '100'})`);
      setInvalidIndex(index);
      setIsValidationOpen(true);
    } else if (value === '') {
      // Show validation error for empty values
      setValidationMessage(`Bay ${index + 1}: Please enter a spacing value`);
      setInvalidIndex(index);
      setIsValidationOpen(true);
    }
  };

  // Close validation message
  const closeValidation = () => {
    setIsValidationOpen(false);
    setInvalidIndex(-1);
  };

  // Auto-close validation after 5 seconds
  useEffect(() => {
    if (isValidationOpen) {
      const timer = setTimeout(() => {
        closeValidation();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isValidationOpen]);

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
            <div className="flex-1">
              <input
                type="text"
                value={inputValues[index] || ''}
                onChange={(e) => handleSpacingChange(index, e.target.value)}
                onBlur={(e) => handleBlur(index, e.target.value)}
                className={`w-full py-2 px-3 border font-medium focus:outline-none focus:border-black transition-colors ${
                  invalidIndex === index 
                    ? 'border-red-300 bg-red-50 text-red-700' 
                    : 'border-gray-300 bg-white text-gray-800'
                }`}
                placeholder={unit === 'inch' ? "4.5" : "100"}
              />
              {unit === 'inch' && (
                <p className="text-xs text-slate-500 mt-1">
                  Enter measurement in decimal inches (e.g., 42.625)
                </p>
              )}
            </div>
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
            <span className="text-slate-600">Side Protrusions (2&quot; each):</span>
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
      <div className="mt-4 bg-blue-50 p-4 border border-blue-200">
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-medium">Decimal input:</span> You can enter decimal values (e.g., {unit === 'inch' ? '4.5' : '100.5'}) with up to 3 decimal places
          <br />
          <span className="font-medium">Note:</span> Each bay can have different spacing for custom layouts.
          Adjust individual bay spacings to fit your design requirements.
        </p>
      </div>

      {/* Validation Message */}
      {isValidationOpen && (
        <div className="mt-4 bg-red-50 border border-red-200 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{validationMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={closeValidation}
                className="inline-flex text-red-400 hover:text-red-500"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaySpacingInput;
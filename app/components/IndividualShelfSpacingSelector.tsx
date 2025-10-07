import React, { useState, useEffect } from 'react';

interface IndividualShelfSpacingSelectorProps {
  shelfQuantity: number;
  onSpacingChange: (spacings: number[]) => void;
  defaultSpacing?: number;
  unit: 'inch' | 'mm';
}

const IndividualShelfSpacingSelector: React.FC<IndividualShelfSpacingSelectorProps> = ({
  shelfQuantity,
  onSpacingChange,
  defaultSpacing = 250,
  unit
}) => {
  const [isValidationOpen, setIsValidationOpen] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [invalidIndex, setInvalidIndex] = useState<number>(-1);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const prevShelfQuantityRef = React.useRef<number>(shelfQuantity);

  // Convert to mm for internal use
  const convertToMm = (value: number, unit: 'inch' | 'mm'): number => {
    if (unit === 'inch') {
      return Math.round(value * 25.4); // 1 inch = 25.4 mm, rounded to whole number
    } else {
      return Math.round(value); // Already in mm, round to whole number
    }
  };

  // Convert from mm to display unit
  const convertFromMm = (value: number, unit: 'inch' | 'mm'): number => {
    if (unit === 'inch') {
      return Math.round((value / 25.4) * 100) / 100; // Convert mm to inches, round to 2 decimal places
    } else {
      return value; // Already in mm
    }
  }
  const [individualSpacings, setIndividualSpacings] = useState<number[]>([defaultSpacing]);
  const [displayValues, setDisplayValues] = useState<string[]>([convertFromMm(defaultSpacing, unit).toFixed(1)]);
  const [inputValues, setInputValues] = useState<string[]>([convertFromMm(defaultSpacing, unit).toFixed(1)]);

  // Initialize spacings when shelf quantity changes
  useEffect(() => {
    if (shelfQuantity > 0 && (shelfQuantity !== prevShelfQuantityRef.current || !isInitialized)) {
      prevShelfQuantityRef.current = shelfQuantity;
      const initialSpacings = Array(shelfQuantity).fill(defaultSpacing);
      setIndividualSpacings(initialSpacings);
      // Initialize display values
      const initialDisplayValues = initialSpacings.map(spacing => 
        convertFromMm(spacing, unit).toFixed(1)
      );
      setDisplayValues(initialDisplayValues);
      // Initialize input values for decimal input handling
      setInputValues(initialDisplayValues);
      onSpacingChange([...initialSpacings]);
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shelfQuantity, defaultSpacing, unit]); // Removed onSpacingChange from dependencies to prevent infinite loops

  // Call onSpacingChange when individualSpacings changes (but not during initial setup)
  useEffect(() => {
    if (isInitialized && individualSpacings.length > 0 && individualSpacings.length === shelfQuantity) {
      onSpacingChange([...individualSpacings]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [individualSpacings]); // Removed shelfQuantity and onSpacingChange from dependencies

  // Update display values when unit changes from parent
  useEffect(() => {
    const newDisplayValues = individualSpacings.map(spacing => 
      convertFromMm(spacing, unit).toFixed(1)
    );
    setDisplayValues(newDisplayValues);
    setInputValues(newDisplayValues);
  }, [unit, individualSpacings]);

  // Handle individual spacing change
  const handleSpacingChange = (index: number, value: string) => {
    // Allow decimal input with up to 3 decimal places
    if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
      // Update input values immediately for better UX
      const newInputValues = [...inputValues];
      newInputValues[index] = value;
      setInputValues(newInputValues);
      
      // Update display values
      const newDisplayValues = [...displayValues];
      newDisplayValues[index] = value;
      setDisplayValues(newDisplayValues);
      
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
      }
    }
  };

  // Handle blur event for validation
  const handleBlur = (index: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      const valueInInches = unit === 'inch' ? numValue : numValue / 25.4;
      const minInches = 6;
      const maxInches = 70;
      
      if (valueInInches < minInches || valueInInches > maxInches) {
        const currentValue = unit === 'inch' ? `${numValue}"` : `${Math.round(numValue)}mm (${valueInInches.toFixed(1)}")`;
        setValidationMessage(`Shelf ${index + 1} spacing must be between 6" and 70". Current value: ${currentValue}`);
        setInvalidIndex(index);
        setIsValidationOpen(true);
      }
    } else if (value !== '' && (isNaN(numValue) || numValue <= 0)) {
      // Show validation error for invalid non-empty values
      setValidationMessage(`Shelf ${index + 1}: Please enter a valid positive number (e.g., ${unit === 'inch' ? '12.5' : '305'})`);
      setInvalidIndex(index);
      setIsValidationOpen(true);
    } else if (value === '') {
      // Show validation error for empty values
      setValidationMessage(`Shelf ${index + 1}: Please enter a spacing value`);
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

  return (
    <div className="bg-white p-6 border border-gray-300">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Individual Shelf Spacing ({unit})</h3>

      {/* Individual Spacing Inputs */}
      <div className="space-y-3">
        {Array.from({ length: shelfQuantity }, (_, index) => (
          <div key={index} className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 w-20">
              Shelf {index + 1}:
            </label>
            <div className="flex-1">
              <input
                type="text"
                value={inputValues[index] || ''}
                onChange={(e) => handleSpacingChange(index, e.target.value)}
                onBlur={(e) => handleBlur(index, e.target.value)}
                className={`form-input ${
                  invalidIndex === index 
                    ? 'border-red-300 bg-red-50 text-red-700' 
                    : ''
                }`}
                placeholder={unit === 'inch' ? "12.5" : "305"}
              />
            </div>
            <span className="text-sm text-slate-600 w-12">{unit}</span>
          </div>
        ))}
      </div>

      {/* Helper text for all inputs */}
      <p className="text-xs text-slate-500 mt-2">
        {unit === 'inch' 
          ? 'Enter measurements in decimal inches (e.g., 42.625)' 
          : 'Enter measurements in whole millimeters (e.g., 1083)'}
      </p>

      {/* Help Text */}
      <div className="mt-4 bg-blue-50 p-4 border border-blue-200">
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-medium">Recommended range:</span> {unit === 'inch' ? '6-70 inch' : '152-1778 mm'}
          <br />
          <span className="font-medium">Decimal input:</span> You can enter decimal values (e.g., {unit === 'inch' ? '12.375' : '305.5'}) with up to 3 decimal places
          <br />
          <span className="font-medium">Note:</span> Each shelf can have different spacing for custom layouts
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

export default IndividualShelfSpacingSelector; 
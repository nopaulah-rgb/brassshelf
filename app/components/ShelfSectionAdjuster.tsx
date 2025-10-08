import React, { useState, useEffect } from 'react';

interface ShelfSectionAdjusterProps {
  barCount: number;
  sectionWidths: { sectionIndex: number; width: number }[]; // custom width in mm
  onSectionWidthsChange: (widths: { sectionIndex: number; width: number }[]) => void;
  defaultWidth?: number; // Default width per section in mm
  unit: 'inch' | 'mm';
}

type Unit = 'mm' | 'inch';

const ShelfSectionAdjuster: React.FC<ShelfSectionAdjusterProps> = ({
  barCount,
  sectionWidths,
  onSectionWidthsChange,
  defaultWidth = 914.4, // 36 inches default
  unit
}) => {
  const [individualWidths, setIndividualWidths] = useState<{ sectionIndex: number; width: number }[]>([]);
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [isValidationOpen, setIsValidationOpen] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [invalidIndex, setInvalidIndex] = useState<number>(-1);

  // Helper functions for unit conversion
  const convertToMm = (value: number, fromUnit: Unit): number => {
    if (fromUnit === 'inch') {
      return Math.round(value * 25.4);
    }
    return Math.round(value);
  };

  const convertFromMm = (value: number, toUnit: Unit): number => {
    if (toUnit === 'inch') {
      return Math.round((value / 25.4) * 10) / 10; // 1 decimal place precision
    }
    return Math.round(value); // Round mm values to integers
  };

  // Initialize section widths when barCount changes
  useEffect(() => {
    if (barCount > 0) {
      const newWidths: { sectionIndex: number; width: number }[] = [];
      const newInputValues: { [key: number]: string } = {};
      
      const defaultWidthMm = defaultWidth; // defaultWidth is already in mm (914.4)
      
      for (let i = 0; i < barCount; i++) {
        // Always start with default width for new sections
        const widthInMm = defaultWidthMm;
        
        newWidths.push({ sectionIndex: i, width: widthInMm });
        const convertedValue = convertFromMm(widthInMm, unit);
        newInputValues[i] = convertedValue.toFixed(1);
      }
      
      console.log('Initializing ShelfSectionAdjuster:', { barCount, newInputValues, unit });
      setIndividualWidths(newWidths);
      setInputValues(newInputValues);
      onSectionWidthsChange(newWidths);
    } else {
      setIndividualWidths([]);
      setInputValues({});
      onSectionWidthsChange([]);
    }
  }, [barCount, defaultWidth]); // Don't include unit to avoid re-initialization on unit change

  // Update input values ONLY when unit changes (not when individualWidths change)
  useEffect(() => {
    if (individualWidths.length > 0) {
      const newInputValues: { [key: number]: string } = {};
      individualWidths.forEach(section => {
        const convertedValue = convertFromMm(section.width, unit);
        newInputValues[section.sectionIndex] = convertedValue.toFixed(1);
      });
      setInputValues(newInputValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]); // ONLY depend on unit, NOT individualWidths

  // Update parent when individual widths change
  useEffect(() => {
    if (individualWidths.length > 0) {
      onSectionWidthsChange([...individualWidths]);
    }
  }, [individualWidths, onSectionWidthsChange]);


  const handleWidthChange = (sectionIndex: number, value: string) => {
    // Allow decimal input with up to 3 decimal places
    if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
      // Update input values immediately for better UX
      const newInputValues = { ...inputValues };
      newInputValues[sectionIndex] = value;
      setInputValues(newInputValues);
      
      // Only validate and update internal state for valid numbers
      const numValue = parseFloat(value);
      
      if (!isNaN(numValue) && numValue > 0) {
        // Clear any previous validation errors for this index
        if (invalidIndex === sectionIndex) {
          setInvalidIndex(-1);
          setIsValidationOpen(false);
        }
        
        const widthInMm = convertToMm(numValue, unit);
        
        const newWidths = individualWidths.map(section => 
          section.sectionIndex === sectionIndex 
            ? { ...section, width: widthInMm }
            : section
        );
        setIndividualWidths(newWidths);
      }
    }
  };

  const handleBlur = (sectionIndex: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      // Check if value is within reasonable range
      const minValue = unit === 'inch' ? 6 : 152; // ~6" or ~152mm minimum
      const maxValue = unit === 'inch' ? 120 : 3048; // ~120" or ~3048mm maximum
      
      if (numValue < minValue || numValue > maxValue) {
        const currentValue = unit === 'inch' ? `${numValue}"` : `${Math.round(numValue)}mm`;
        setValidationMessage(`Section ${sectionIndex + 1} width must be between ${minValue}${unit} and ${maxValue}${unit}. Current value: ${currentValue}`);
        setInvalidIndex(sectionIndex);
        setIsValidationOpen(true);
      }
    } else if (value !== '' && (isNaN(numValue) || numValue <= 0)) {
      // Show validation error for invalid non-empty values
      setValidationMessage(`Section ${sectionIndex + 1}: Please enter a valid positive number (e.g., ${unit === 'inch' ? '36' : '914'})`);
      setInvalidIndex(sectionIndex);
      setIsValidationOpen(true);
    } else if (value === '') {
      // Reset to default width for empty values
      const defaultWidthMm = defaultWidth; // defaultWidth is already in mm
      
      const newInputValues = { ...inputValues };
      newInputValues[sectionIndex] = convertFromMm(defaultWidthMm, unit).toFixed(1);
      setInputValues(newInputValues);
      
      const newWidths = individualWidths.map(section => 
        section.sectionIndex === sectionIndex 
          ? { ...section, width: defaultWidthMm }
          : section
      );
      setIndividualWidths(newWidths);
    }
  };

  const resetToDefault = (sectionIndex: number) => {
    const defaultWidthMm = defaultWidth; // defaultWidth is already in mm
    
    const newInputValues = { ...inputValues };
    newInputValues[sectionIndex] = convertFromMm(defaultWidthMm, unit).toFixed(1);
    setInputValues(newInputValues);
    
    const newWidths = individualWidths.map(section => 
      section.sectionIndex === sectionIndex 
        ? { ...section, width: defaultWidthMm }
        : section
    );
    setIndividualWidths(newWidths);
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

  // Calculate total width
  const totalWidth = individualWidths.reduce((sum, section) => sum + section.width, 0);

  // Don't show if only one bay
  if (barCount <= 1) {
    return null;
  }

  return (
    <div className="bg-white p-4 sm:p-6 border border-gray-300">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Custom Section Widths ({unit})</h3>
      
      <p className="text-sm text-slate-600 mb-4">
        Enter custom width for each shelf section. The system remains connected as one unit.
      </p>

      {/* Individual Section Width Inputs */}
      <div className="space-y-3 mb-4">
        {Array.from({ length: barCount }, (_, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <label className="text-sm font-medium text-slate-700 sm:w-24 flex-shrink-0">
              Section {index + 1}:
            </label>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={inputValues[index] || ''}
                onChange={(e) => handleWidthChange(index, e.target.value)}
                onBlur={(e) => handleBlur(index, e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  invalidIndex === index 
                    ? 'border-red-300 bg-red-50 text-red-700 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
                placeholder={unit === 'inch' ? "36.0" : "914"}
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm text-slate-600 w-8 sm:w-12 flex-shrink-0">{unit}</span>
              <button
                onClick={() => resetToDefault(index)}
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 flex-shrink-0"
                title="Reset to default"
              >
                Reset
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Helper text for all inputs */}
      <p className="text-xs text-slate-500 mt-2 mb-4">
        {unit === 'inch' 
          ? 'Enter measurements in decimal inches (e.g., 36.5)' 
          : 'Enter measurements in whole millimeters (e.g., 914)'}
      </p>

      {/* Width Summary */}
      <div className="bg-white p-3 sm:p-4 border border-gray-300">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Width Summary</h4>
        
        <div className="space-y-2 text-sm">
          {individualWidths.map((section) => {
            const defaultWidthMm = defaultWidth; // defaultWidth is already in mm
            const isDefault = section.width === defaultWidthMm;
            return (
              <div key={section.sectionIndex} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-slate-600">Section {section.sectionIndex + 1}:</span>
                <span className={`font-medium ${isDefault ? 'text-slate-600' : 'text-blue-600'} break-all`}>
                  {convertFromMm(section.width, unit)}{unit}
                  {!isDefault && (
                    <span className="text-xs text-slate-500 ml-1 block sm:inline">
                      (default: {convertFromMm(defaultWidthMm, unit)}{unit})
                    </span>
                  )}
                </span>
              </div>
            );
          })}
          
          <hr className="border-slate-200" />
          
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
            <span className="text-slate-600 font-medium">Total Width:</span>
            <span className="font-bold text-blue-600 break-all">
              {convertFromMm(totalWidth, unit)}{unit}
            </span>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 bg-blue-50 p-3 sm:p-4 border border-blue-200">
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-medium">Custom Section Widths:</span> Enter the exact width you want for each shelf section.
          <br />
          <span className="font-medium">Recommended range:</span> {unit === 'inch' ? '6-120 inch' : '152-3048 mm'}
          <br />
          <span className="font-medium">Default width:</span> {convertFromMm(defaultWidth, unit)}{unit}
          <br />
          <span className="font-medium">Note:</span> The system remains connected - no gaps between sections.
        </p>
      </div>

      {/* Validation Message */}
      {isValidationOpen && (
        <div className="mt-4 bg-red-50 border border-red-200 p-3 sm:p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm text-red-700 break-words">{validationMessage}</p>
            </div>
            <div className="ml-auto pl-3 flex-shrink-0">
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

export default ShelfSectionAdjuster;
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';

interface DimensionInputsProps {
  height: number;
  width: number;
  shelfDepth: number;
  totalDepth: number;
  unit: 'inch' | 'mm';
  selectedDepthType: 'shelf' | 'total';
  onHeightChange: (value: number) => void;
  onWidthChange: (value: number) => void;
  onShelfDepthChange: (value: number) => void;
  onTotalDepthChange: (value: number) => void;
  onDepthTypeChange: (depthType: 'shelf' | 'total') => void;
  onUnitChange: (unit: 'inch' | 'mm') => void;
}

const DimensionInputs: React.FC<DimensionInputsProps> = ({
  height,
  width,
  shelfDepth,
  totalDepth,
  unit,
  selectedDepthType,
  onHeightChange,
  onWidthChange,
  onShelfDepthChange,
  onTotalDepthChange,
  onDepthTypeChange,
  onUnitChange,
}) => {
  const [isValidationOpen, setIsValidationOpen] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  
  // Local input states for handling decimal input
  const [heightInput, setHeightInput] = useState<string>('');
  const [widthInput, setWidthInput] = useState<string>('');
  const [shelfDepthInput, setShelfDepthInput] = useState<string>('');
  const [totalDepthInput, setTotalDepthInput] = useState<string>('');

  // Update local states when props change (e.g., unit conversion)
  useEffect(() => {
    setHeightInput(unit === 'mm' ? Math.round(height).toString() : height.toString());
    setWidthInput(unit === 'mm' ? Math.round(width).toString() : width.toString());
    setShelfDepthInput(unit === 'mm' ? Math.round(shelfDepth).toString() : shelfDepth.toString());
    setTotalDepthInput(unit === 'mm' ? Math.round(totalDepth).toString() : totalDepth.toString());
  }, [height, width, shelfDepth, totalDepth, unit]);
  const convertValue = (value: number, fromUnit: 'inch' | 'mm', toUnit: 'inch' | 'mm'): number => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'inch' && toUnit === 'mm') {
      // Convert inches to mm: 42 inch → 1067 mm
      return Math.round(value * 25.4);
    }
    // Convert mm to inches: 1067 mm → 42 inch
    return Math.round((value / 25.4) * 100) / 100;
  };

  const handleUnitToggle = () => {
    const newUnit = unit === 'inch' ? 'mm' : 'inch';
    onUnitChange(newUnit);
    
    // Convert all values
    onHeightChange(convertValue(height, unit, newUnit));
    onWidthChange(convertValue(width, unit, newUnit));
    onShelfDepthChange(convertValue(shelfDepth, unit, newUnit));
    onTotalDepthChange(convertValue(totalDepth, unit, newUnit));
  };

  const handleWidthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow decimal input with up to 3 decimal places
    if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
      setWidthInput(value);
      const nextValue = value === '' ? 0 : parseFloat(value);
      onWidthChange(nextValue);
    }
  };

  const handleShelfDepthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow decimal input with up to 3 decimal places
    if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
      setShelfDepthInput(value);
      const nextValue = value === '' ? 0 : parseFloat(value);
      onShelfDepthChange(nextValue);
    }
  };

  const handleHeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow decimal input with up to 3 decimal places
    if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
      setHeightInput(value);
      const nextValue = value === '' ? 0 : parseFloat(value);
      onHeightChange(nextValue);
    }
  };

  const handleTotalDepthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow decimal input with up to 3 decimal places
    if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
      setTotalDepthInput(value);
      const nextValue = value === '' ? 0 : parseFloat(value);
      onTotalDepthChange(nextValue);
    }
  };

  const handleWidthBlur = () => {
    const valueInInches = unit === 'inch' ? width : width / 25.4;
    const minInches = 5;
    const maxInches = 100;
    if (valueInInches < minInches || valueInInches > maxInches) {
      setValidationMessage('Width must be between 5" and 100".');
      setIsValidationOpen(true);
    }
  };

  const handleShelfDepthBlur = () => {
    const valueInInches = unit === 'inch' ? shelfDepth : shelfDepth / 25.4;
    const minInches = 12;
    const maxInches = 20;
    if (valueInInches < minInches || valueInInches > maxInches) {
      setValidationMessage('Shelf depth must be between 12" and 20".');
      setIsValidationOpen(true);
    }
  };

  return (
    <div>

      <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="height">Height ({unit})</label>
          <input
            className="form-input"
            id="height"
            type="text"
            value={heightInput}
            onChange={handleHeightInputChange}
            placeholder={unit === 'inch' ? "e.g., 72" : "e.g., 1830"}
          />
          {unit === 'inch' && (
            <p className="text-xs text-slate-500 mt-1">
              Enter measurement in decimal inches (e.g., 42.625)
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="width">Width ({unit})</label>
          <input
            className="form-input"
            id="width"
            type="text"
            value={widthInput}
            onChange={handleWidthInputChange}
            onBlur={handleWidthBlur}
            placeholder={unit === 'inch' ? "e.g., 36" : "e.g., 914"}
          />
          {unit === 'inch' && (
            <p className="text-xs text-slate-500 mt-1">
              Enter measurement in decimal inches (e.g., 42.625)
            </p>
          )}
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <label className="block text-sm font-medium" htmlFor="shelf-depth">Shelf Depth ({unit})</label>
            <div className="tooltip-container relative flex items-center">
              <svg className="h-4 w-4 cursor-help text-gray-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" x2="12" y1="16" y2="12"></line>
                <line x1="12" x2="12.01" y1="8" y2="8"></line>
              </svg>
              <div className="tooltip">This is the depth of the shelf surface itself.</div>
            </div>
          </div>
          <input
            className="form-input"
            id="shelf-depth"
            type="text"
            value={shelfDepthInput}
            onChange={handleShelfDepthInputChange}
            onBlur={handleShelfDepthBlur}
            placeholder={unit === 'inch' ? "e.g., 12" : "e.g., 305"}
          />
          {unit === 'inch' && (
            <p className="text-xs text-slate-500 mt-1">
              Enter measurement in decimal inches (e.g., 42.625)
            </p>
          )}
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <label className="block text-sm font-medium" htmlFor="total-depth">Total Depth ({unit})</label>
            <div className="tooltip-container relative flex items-center">
              <svg className="h-4 w-4 cursor-help text-gray-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" x2="12" y1="16" y2="12"></line>
                <line x1="12" x2="12.01" y1="8" y2="8"></line>
              </svg>
              <div className="tooltip">The full depth of the unit including mounting hardware.</div>
            </div>
          </div>
          <input
            className="form-input"
            id="total-depth"
            type="text"
            value={totalDepthInput}
            onChange={handleTotalDepthInputChange}
            placeholder={unit === 'inch' ? "e.g., 13.5" : "e.g., 343"}
          />
          {unit === 'inch' && (
            <p className="text-xs text-slate-500 mt-1">
              Enter measurement in decimal inches (e.g., 42.625)
            </p>
          )}
        </div>
      </div>

      {/* Validation Message */}
      {isValidationOpen && (
        <div className="bg-red-50 border border-red-200 p-4">
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
                onClick={() => setIsValidationOpen(false)}
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

export default DimensionInputs; 
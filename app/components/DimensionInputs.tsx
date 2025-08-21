/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';

interface DimensionInputsProps {
  height: number;
  width: number;
  shelfDepth: number;
  totalDepth: number;
  unit: 'inch' | 'cm';
  onHeightChange: (value: number) => void;
  onWidthChange: (value: number) => void;
  onShelfDepthChange: (value: number) => void;
  onTotalDepthChange: (value: number) => void;
  onUnitChange: (unit: 'inch' | 'cm') => void;
}

const DimensionInputs: React.FC<DimensionInputsProps> = ({
  height,
  width,
  shelfDepth,
  totalDepth,
  unit,
  onHeightChange,
  onWidthChange,
  onShelfDepthChange,
  onTotalDepthChange,
  onUnitChange,
}) => {
  const [isValidationOpen, setIsValidationOpen] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const convertValue = (value: number, fromUnit: 'inch' | 'cm', toUnit: 'inch' | 'cm'): number => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'inch' && toUnit === 'cm') return value * 2.54;
    return value / 2.54;
  };

  const handleUnitToggle = () => {
    const newUnit = unit === 'inch' ? 'cm' : 'inch';
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
      const nextValue = parseFloat(value) || 0;
      onWidthChange(nextValue);
    }
  };

  const handleShelfDepthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow decimal input with up to 3 decimal places
    if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
      const nextValue = parseFloat(value) || 0;
      onShelfDepthChange(nextValue);
    }
  };

  const handleHeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow decimal input with up to 3 decimal places
    if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
      const nextValue = parseFloat(value) || 0;
      onHeightChange(nextValue);
    }
  };

  const handleTotalDepthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow decimal input with up to 3 decimal places
    if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
      const nextValue = parseFloat(value) || 0;
      onTotalDepthChange(nextValue);
    }
  };

  const handleWidthBlur = () => {
    const valueInInches = unit === 'inch' ? width : width / 2.54;
    const minInches = 5;
    const maxInches = 100;
    if (valueInInches < minInches || valueInInches > maxInches) {
      setValidationMessage('Width must be between 5" and 100".');
      setIsValidationOpen(true);
    }
  };

  const handleShelfDepthBlur = () => {
    const valueInInches = unit === 'inch' ? shelfDepth : shelfDepth / 2.54;
    const minInches = 12;
    const maxInches = 20;
    if (valueInInches < minInches || valueInInches > maxInches) {
      setValidationMessage('Shelf depth must be between 12" and 20".');
      setIsValidationOpen(true);
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">Dimensions</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUnitToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              unit === 'inch' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
            }`}
          >
            inch
          </button>
          <button
            onClick={handleUnitToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              unit === 'cm' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
            }`}
          >
            cm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Height</label>
          <input
            type="text"
            value={height}
            onChange={handleHeightInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
            placeholder={unit === 'inch' ? "Enter measurement in decimal inches (e.g., 42.625)" : "Height"}
          />
          {unit === 'inch' && (
            <p className="text-xs text-slate-500 mt-1">Enter measurement in decimal inches (e.g., 42.625)</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Width</label>
          <input
            type="text"
            value={width}
            onChange={handleWidthInputChange}
            onBlur={handleWidthBlur}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
            placeholder={unit === 'inch' ? "Enter measurement in decimal inches (e.g., 36.125)" : "Width"}
          />
          {unit === 'inch' && (
            <p className="text-xs text-slate-500 mt-1">Enter measurement in decimal inches (e.g., 36.125)</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Shelf Depth</label>
          <input
            type="text"
            value={shelfDepth}
            onChange={handleShelfDepthInputChange}
            onBlur={handleShelfDepthBlur}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
            placeholder={unit === 'inch' ? "Enter measurement in decimal inches (e.g., 12.375)" : "Shelf Depth"}
          />
          {unit === 'inch' && (
            <p className="text-xs text-slate-500 mt-1">Enter measurement in decimal inches (e.g., 12.375)</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Total Depth</label>
          <input
            type="text"
            value={totalDepth}
            onChange={handleTotalDepthInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
            placeholder={unit === 'inch' ? "Enter measurement in decimal inches (e.g., 12.375)" : "Total Depth"}
          />
          {unit === 'inch' && (
            <p className="text-xs text-slate-500 mt-1">Enter measurement in decimal inches (e.g., 12.375)</p>
          )}
        </div>
      </div>

      {/* Validation Message */}
      {isValidationOpen && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
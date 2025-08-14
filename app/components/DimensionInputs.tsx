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
    const nextValue = parseFloat(e.target.value) || 0;
    onWidthChange(nextValue);
  };

  const handleShelfDepthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = parseFloat(e.target.value) || 0;
    onShelfDepthChange(nextValue);
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
    <div className="bg-[#8BBBD9] rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#1E3A5F] font-semibold">Dimensions:</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUnitToggle}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              unit === 'inch' 
                ? 'bg-[#1E3A5F] text-white' 
                : 'bg-white/60 text-[#1E3A5F]'
            }`}
          >
            inch
          </button>
          <button
            onClick={handleUnitToggle}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              unit === 'cm' 
                ? 'bg-[#1E3A5F] text-white' 
                : 'bg-white/60 text-[#1E3A5F]'
            }`}
          >
            cm
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[#1E3A5F] font-medium">Height:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={height.toFixed(0)}
              onChange={(e) => onHeightChange(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 text-center text-[#1E3A5F] font-bold text-lg bg-transparent border-b-2 border-[#1E3A5F] focus:outline-none"
            />
            <span className="text-[#1E3A5F] font-medium">{unit === 'inch' ? '"' : 'cm'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#1E3A5F] font-medium">Width:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={width.toFixed(0)}
              onChange={handleWidthInputChange}
              onBlur={handleWidthBlur}
              className="w-20 px-2 py-1 text-center text-[#1E3A5F] font-bold text-lg bg-transparent border-b-2 border-[#1E3A5F] focus:outline-none"
            />
            <span className="text-[#1E3A5F] font-medium">{unit === 'inch' ? '"' : 'cm'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#1E3A5F] font-medium">Depth:</span>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[#1E3A5F] text-sm">Total Depth:</span>
              <input
                type="number"
                value={totalDepth.toFixed(0)}
                onChange={(e) => onTotalDepthChange(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-center text-[#1E3A5F] font-bold bg-transparent border-b-2 border-[#1E3A5F] focus:outline-none"
              />
              <span className="text-[#1E3A5F] font-medium">{unit === 'inch' ? '"' : 'cm'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#1E3A5F] text-sm">Shelf Depth:</span>
              <input
                type="number"
                value={shelfDepth.toFixed(0)}
                onChange={handleShelfDepthInputChange}
                onBlur={handleShelfDepthBlur}
                className="w-16 px-2 py-1 text-center text-[#1E3A5F] font-bold bg-transparent border-b-2 border-[#1E3A5F] focus:outline-none"
              />
              <span className="text-[#1E3A5F] font-medium">{unit === 'inch' ? '"' : 'cm'}</span>
            </div>
          </div>
        </div>
    </div>

    {isValidationOpen && (
      <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <div className="mb-3 text-lg font-semibold text-gray-900">Invalid Value</div>
          <div className="mb-6 text-gray-700">{validationMessage}</div>
          <div className="flex justify-end">
            <button
              onClick={() => setIsValidationOpen(false)}
              className="rounded-md bg-[#1E3A5F] px-4 py-2 text-white hover:opacity-90"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default DimensionInputs; 
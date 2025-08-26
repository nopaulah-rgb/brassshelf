import React, { useState } from 'react';

interface ShelfSpacingSelectorProps {
  onSelect: (spacing: number) => void;
}

const ShelfSpacingSelector: React.FC<ShelfSpacingSelectorProps> = ({ onSelect }) => {
  const [spacingValue, setSpacingValue] = useState<number>(12); // Default 12 inch 
  const [unit, setUnit] = useState<'inch' | 'mm'>('inch');

  // Convert to mm for internal use
  const convertToMm = (value: number, unit: 'inch' | 'mm'): number => {
    if (unit === 'inch') {
      return Math.round(value * 25.4); // 1 inch = 25.4 mm, rounded to whole number
    } else {
      return Math.round(value); // Already in mm, round to whole number
    }
  };

  const handleValueChange = (value: number) => {
    if (value && value > 0) { // Sadece geçerli değerler için güncelle
      setSpacingValue(value);
      const spacingInMm = convertToMm(value, unit);
      onSelect(spacingInMm);
    }
  };

  const handleUnitChange = (newUnit: 'inch' | 'mm') => {
    // Convert current value to the new unit
    let newValue: number;
    if (unit === 'inch' && newUnit === 'mm') {
      // Convert from inches to mm: 12 inch → 305 mm
      newValue = Math.round(spacingValue * 25.4);
    } else if (unit === 'mm' && newUnit === 'inch') {
      // Convert from mm to inches: 305 mm → 12 inch
      newValue = Math.round((spacingValue / 25.4) * 100) / 100;
    } else {
      // Same unit, no conversion needed
      newValue = spacingValue;
    }
    
    setSpacingValue(newValue);
    setUnit(newUnit);
    const spacingInMm = convertToMm(newValue, newUnit);
    onSelect(spacingInMm);
  };

  // Anında güncelleme için unit değişiminde de tetikle
  React.useEffect(() => {
    if (spacingValue > 0) {
      const spacingInMm = convertToMm(spacingValue, unit);
      onSelect(spacingInMm);
    }
  }, [spacingValue, unit, onSelect]);

  // Auto-select default on mount
  React.useEffect(() => {
    const defaultSpacingInMm = convertToMm(spacingValue, unit);
    onSelect(defaultSpacingInMm);
  }, []);

  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Shelf Spacing (Rib Length)</h3>
      
      {/* Input and Unit Selection */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <input
            type="number"
            value={unit === 'mm' ? Math.round(spacingValue) : spacingValue}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              handleValueChange(newValue);
            }}
            onInput={(e) => {
              // Anında güncelleme için onInput de kullan
              const newValue = Number((e.target as HTMLInputElement).value);
              if (newValue && newValue > 0) {
                handleValueChange(newValue);
              }
            }}
            min={unit === 'inch' ? "6" : "152"}
            max={unit === 'inch' ? "20" : "508"}
            step={unit === 'inch' ? "0.5" : "1"}
            className="w-full py-3 px-4 border border-slate-300 rounded-lg 
                     text-slate-700 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-500
                     focus:outline-none text-center font-medium transition-all duration-200"
            placeholder={unit === 'inch' ? "12" : "305"}
          />
          <p className="text-xs text-slate-500 mt-2 text-center">
            {unit === 'inch' 
              ? 'Enter measurement in decimal inches (e.g., 12.5)' 
              : 'Enter measurement in whole millimeters'
            }
          </p>
        </div>
        
        {/* Unit Toggle */}
        <div className="flex border border-slate-300 rounded-lg overflow-hidden">
          <button
            onClick={() => handleUnitChange('inch')}
            className={`px-4 py-3 text-sm font-medium transition-all duration-200 ${
              unit === 'inch'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            inch
          </button>
          <button
            onClick={() => handleUnitChange('mm')}
            className={`px-4 py-3 text-sm font-medium transition-all duration-200 ${
              unit === 'mm'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            mm
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-medium">Default rib length:</span> {unit === 'inch' ? '12 inch' : '305 mm'}
          <br />
          <span className="font-medium">Recommended range:</span> {unit === 'inch' ? '6-20 inch' : '152-508 mm'}
          <br />
          <span className="font-medium">Note:</span> This setting determines spacing between shelves and rib length
        </p>
      </div>
    </div>
  );
};

export default ShelfSpacingSelector; 
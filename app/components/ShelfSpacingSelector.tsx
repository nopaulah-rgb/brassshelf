import React, { useState } from 'react';

interface ShelfSpacingSelectorProps {
  onSelect: (spacing: number) => void;
}

const ShelfSpacingSelector: React.FC<ShelfSpacingSelectorProps> = ({ onSelect }) => {
  const [spacingValue, setSpacingValue] = useState<number>(12); // Default 12 inch 
  const [unit, setUnit] = useState<'inch' | 'cm'>('inch');

  // Convert to mm for internal use
  const convertToMm = (value: number, unit: 'inch' | 'cm'): number => {
    if (unit === 'inch') {
      return value * 25.4; // 1 inch = 25.4 mm
    } else {
      return value * 10; // 1 cm = 10 mm
    }
  };

  const handleValueChange = (value: number) => {
    if (value && value > 0) { // Sadece geçerli değerler için güncelle
      setSpacingValue(value);
      const spacingInMm = convertToMm(value, unit);
      onSelect(spacingInMm);
    }
  };

  const handleUnitChange = (newUnit: 'inch' | 'cm') => {
    setUnit(newUnit);
    const spacingInMm = convertToMm(spacingValue, newUnit);
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
    <div className="bg-[#8BBBD9] rounded-lg p-4">
      <h3 className="text-[#1E3A5F] font-semibold mb-3">Shelf Spacing (Rib Length):</h3>
      
      {/* Input and Unit Selection */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <input
            type="number"
            value={spacingValue}
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
                         min={unit === 'inch' ? "6" : "15"}
             max={unit === 'inch' ? "20" : "60"}
            step={unit === 'inch' ? "0.5" : "1"}
            className="w-full py-2 px-3 border-2 border-[#1E3A5F]/20 rounded-lg 
                     text-[#1E3A5F] bg-white/80 focus:border-[#1E3A5F] 
                     focus:outline-none text-center font-medium transition-all duration-200"
                         placeholder={unit === 'inch' ? "12" : "30"}
          />
        </div>
        
        {/* Unit Toggle */}
        <div className="flex border-2 border-[#1E3A5F]/20 rounded-lg overflow-hidden">
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
      </div>

      {/* Help Text */}
      <p className="text-xs text-[#1E3A5F]/70">
        Default rib length: 12 inch ({unit === 'inch' ? '12 inch' : '30 cm'})
        <br />
        Recommended range: {unit === 'inch' ? '6-20 inch' : '15-60 cm'}
        <br />
        This setting determines spacing between shelves and rib length
      </p>
    </div>
  );
};

export default ShelfSpacingSelector; 
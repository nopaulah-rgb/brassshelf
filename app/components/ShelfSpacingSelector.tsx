import React, { useState } from 'react';

interface ShelfSpacingSelectorProps {
  onSelect: (spacing: number) => void;
  unit: 'inch' | 'mm';
}

const ShelfSpacingSelector: React.FC<ShelfSpacingSelectorProps> = ({ onSelect, unit }) => {
  const defaultValue = unit === 'inch' ? 12 : 305; // Default 12 inch or 305mm
  const [spacingValue, setSpacingValue] = useState<number>(defaultValue);

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

  // Update spacing value when unit changes from parent
  React.useEffect(() => {
    const newDefaultValue = unit === 'inch' ? 12 : 305;
    setSpacingValue(newDefaultValue);
  }, [unit]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label className="block text-sm font-medium" htmlFor="spacing">Shelf Spacing (Rib Length {unit})</label>
        <div className="tooltip-container relative flex items-center">
          <svg className="h-4 w-4 cursor-help text-gray-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" x2="12" y1="16" y2="12"></line>
            <line x1="12" x2="12.01" y1="8" y2="8"></line>
          </svg>
          <div className="tooltip">The &quot;rib&quot; is the vertical pipe between two shelves. Recommended range: {unit === 'inch' ? '6-20 inch' : '152-508 mm'}</div>
        </div>
      </div>
      <input
        type="number"
        id="spacing"
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
        min={unit === 'inch' ? "6" : "152"}
        max={unit === 'inch' ? "20" : "508"}
        step={unit === 'inch' ? "0.5" : "1"}
        className="form-input"
        placeholder={unit === 'inch' ? "e.g., 14" : "e.g., 356"}
      />
    </div>
  );
};

export default ShelfSpacingSelector; 
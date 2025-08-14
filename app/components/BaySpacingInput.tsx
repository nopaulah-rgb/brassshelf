import React, { useState, useEffect } from 'react';

interface BaySpacingInputProps {
  baySpacing: number;
  onBaySpacingChange: (value: number) => void;
  barCount: number;
}

type Unit = 'mm' | 'inch';

const BaySpacingInput: React.FC<BaySpacingInputProps> = ({ 
  baySpacing, 
  onBaySpacingChange,
  barCount 
}) => {
  const [unit, setUnit] = useState<Unit>('mm');
  const [displayValue, setDisplayValue] = useState<number>(baySpacing);

  // Unit değiştiğinde display value'yu güncelle
  useEffect(() => {
    if (unit === 'inch') {
      setDisplayValue(Math.round((baySpacing / 25.4) * 100) / 100); // mm to inch, 2 decimal places
    } else {
      setDisplayValue(baySpacing);
    }
  }, [unit, baySpacing]);

  const handleUnitChange = (newUnit: Unit) => {
    if (newUnit === unit) return;
    
    if (newUnit === 'inch') {
      // mm'den inch'e çevir
      const inchValue = Math.round((baySpacing / 25.4) * 100) / 100;
      setDisplayValue(inchValue);
    } else {
      // inch'den mm'e çevir
      const mmValue = Math.round(baySpacing * 25.4);
      setDisplayValue(mmValue);
    }
    
    setUnit(newUnit);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setDisplayValue(value);
      
      // Seçilen unit'e göre mm cinsinden değeri hesapla ve parent'a gönder
      if (unit === 'inch') {
        const mmValue = Math.round(value * 25.4);
        onBaySpacingChange(mmValue);
      } else {
        onBaySpacingChange(value);
      }
    }
  };

  const getMaxValue = () => {
    return unit === 'inch' ? 20 : 500; // 20 inch ≈ 508mm
  };

  const getStepValue = () => {
    return unit === 'inch' ? 0.1 : 10;
  };

  // Sadece birden fazla bay olduğunda göster
  if (barCount <= 1) {
    return null;
  }

  return (
    <div className="bg-[#8BBBD9] rounded-lg p-4">
      <h3 className="text-[#1E3A5F] font-semibold mb-3">Bay Spacing:</h3>
      
      {/* Unit Selector */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => handleUnitChange('mm')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            unit === 'mm' 
              ? 'bg-[#1E3A5F] text-white' 
              : 'bg-white/60 text-[#1E3A5F] hover:bg-white/80'
          }`}
        >
          mm
        </button>
        <button
          onClick={() => handleUnitChange('inch')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            unit === 'inch' 
              ? 'bg-[#1E3A5F] text-white' 
              : 'bg-white/60 text-[#1E3A5F] hover:bg-white/80'
          }`}
        >
          inch
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="number"
          value={displayValue}
          onChange={handleChange}
          min="0"
          max={getMaxValue()}
          step={getStepValue()}
          className="w-24 px-3 py-2 border-2 border-[#1E3A5F]/20 rounded-lg 
                   bg-white/60 text-[#1E3A5F] font-medium
                   focus:outline-none focus:border-[#1E3A5F] focus:bg-white/80"
        />
        <span className="text-[#1E3A5F] text-sm">{unit}</span>
      </div>
      
      <p className="text-[#1E3A5F]/70 text-xs mt-2">
        Space between bays: {baySpacing}mm ({Math.round((baySpacing / 25.4) * 100) / 100} inch)
      </p>
    </div>
  );
};

export default BaySpacingInput;
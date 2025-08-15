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
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Bay Spacing</h3>
      
      {/* Unit Selector */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => handleUnitChange('mm')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            unit === 'mm' 
              ? 'bg-slate-900 text-white shadow-md' 
              : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
          }`}
        >
          mm
        </button>
        <button
          onClick={() => handleUnitChange('inch')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            unit === 'inch' 
              ? 'bg-slate-900 text-white shadow-md' 
              : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
          }`}
        >
          inch
        </button>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="number"
          value={displayValue}
          onChange={handleChange}
          min="0"
          max={getMaxValue()}
          step={getStepValue()}
          className="w-32 px-4 py-3 border border-slate-300 rounded-lg 
                   bg-white text-slate-700 font-medium
                   focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
        />
        <span className="text-slate-700 text-sm font-medium">{unit}</span>
      </div>
      
      <p className="text-slate-500 text-sm mt-3">
        Space between bays: <span className="font-medium">{baySpacing}mm</span> ({Math.round((baySpacing / 25.4) * 100) / 100} inch)
      </p>
    </div>
  );
};

export default BaySpacingInput;
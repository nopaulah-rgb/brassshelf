import React from 'react';

interface BaySpacingInputProps {
  baySpacing: number;
  onBaySpacingChange: (value: number) => void;
  barCount: number;
}

const BaySpacingInput: React.FC<BaySpacingInputProps> = ({ 
  baySpacing, 
  onBaySpacingChange,
  barCount 
}) => {
  // Sadece birden fazla bay olduğunda göster
  if (barCount <= 1) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onBaySpacingChange(value);
    }
  };

  return (
    <div className="bg-[#8BBBD9] rounded-lg p-4">
      <h3 className="text-[#1E3A5F] font-semibold mb-3">Bay Spacing (mm):</h3>
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={baySpacing}
          onChange={handleChange}
          min="0"
          max="500"
          step="10"
          className="w-24 px-3 py-2 border-2 border-[#1E3A5F]/20 rounded-lg 
                   bg-white/60 text-[#1E3A5F] font-medium
                   focus:outline-none focus:border-[#1E3A5F] focus:bg-white/80"
        />
        <span className="text-[#1E3A5F] text-sm">mm</span>
      </div>
      <p className="text-[#1E3A5F]/70 text-xs mt-2">
        Space between bays: {baySpacing}mm
      </p>
    </div>
  );
};

export default BaySpacingInput;
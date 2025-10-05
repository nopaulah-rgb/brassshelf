import React, { useState } from 'react';

const BarSelector: React.FC<{ onSelect: (barCount: number) => void }> = ({ onSelect }) => {
  const [selectedBar, setSelectedBar] = useState<number>(1);

  const handleBarChange = (value: number) => {
    setSelectedBar(value);
    onSelect(value);
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label className="block text-sm font-medium" htmlFor="bays">Number of Bays</label>
        <div className="tooltip-container relative flex items-center">
          <svg className="h-4 w-4 cursor-help text-gray-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" x2="12" y1="16" y2="12"></line>
            <line x1="12" x2="12.01" y1="8" y2="8"></line>
          </svg>
          <div className="tooltip">Bays are the vertical sections of the shelving unit.</div>
        </div>
      </div>
      <input
        className="form-input"
        id="bays"
        type="number"
        value={selectedBar}
        onChange={(e) => handleBarChange(Number(e.target.value))}
        min="1"
        max="10"
        placeholder="e.g., 2"
      />
    </div>
  );
};

export default BarSelector; 
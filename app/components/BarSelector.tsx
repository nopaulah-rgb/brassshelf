import React, { useState } from 'react';

const BarSelector: React.FC<{ onSelect: (barCount: number) => void }> = ({ onSelect }) => {
  const [selectedBar, setSelectedBar] = useState<number>(1);

  const handleBarChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    setSelectedBar(value);
    onSelect(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-medium text-gray-900">
        Select Bays
      </h3>
      <div className="relative">
        <select
          className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900 text-lg"
          value={selectedBar}
          onChange={handleBarChange}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BarSelector; 
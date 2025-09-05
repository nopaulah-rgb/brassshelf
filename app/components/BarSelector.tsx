import React, { useState } from 'react';

const BarSelector: React.FC<{ onSelect: (barCount: number) => void }> = ({ onSelect }) => {
  const [selectedBar, setSelectedBar] = useState<number>(1);

  const handleBarChange = (value: number) => {
    setSelectedBar(value);
    onSelect(value);
  };

  return (
    <div className="bg-white p-6 border border-gray-300">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Number of Bays</h3>
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((value) => (
          <button
            key={value}
            onClick={() => handleBarChange(value)}
            className={`w-14 h-14 border transition-colors
                     flex items-center justify-center text-lg font-medium ${
                       selectedBar === value 
                         ? 'border-black bg-black text-white' 
                         : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
                     }`}
          >
            {value}
          </button>
        ))}
        <button
          className="w-14 h-14 border border-gray-300 bg-white 
                     flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BarSelector; 
import React, { useState } from 'react';

const BarSelector: React.FC<{ onSelect: (barCount: number) => void }> = ({ onSelect }) => {
  const [selectedBar, setSelectedBar] = useState<number>(1);

  const handleBarChange = (value: number) => {
    setSelectedBar(value);
    onSelect(value);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          onClick={() => handleBarChange(value)}
          className={`h-14 border-2 rounded-lg transition-colors duration-200
                   flex items-center justify-center text-lg
                   focus:outline-none ${
                     selectedBar === value 
                       ? 'border-white bg-gray-800/5 text-gray-800' 
                       : 'border-gray-800/20 text-gray-600 hover:border-gray-800/40'
                   }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
};

export default BarSelector; 
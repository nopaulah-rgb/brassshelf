import React, { useState } from 'react';

const BarSelector: React.FC<{ onSelect: (barCount: number) => void }> = ({ onSelect }) => {
  const [selectedBar, setSelectedBar] = useState<number>(1);

  const handleBarChange = (value: number) => {
    setSelectedBar(value);
    onSelect(value);
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => handleBarChange(1)}
        className={`w-32 h-16 border-2 rounded-lg transition-colors duration-200
                   flex items-center justify-center text-xl
                   focus:outline-none ${
                     selectedBar === 1 
                       ? 'border-white bg-gray-800/5 text-gray-800' 
                       : 'border-gray-800/20 text-gray-600 hover:border-gray-800/40'
                   }`}
      >
        1
      </button>
      <button
        onClick={() => handleBarChange(2)}
        className={`w-32 h-16 border-2 rounded-lg transition-colors duration-200
                   flex items-center justify-center text-xl
                   focus:outline-none ${
                     selectedBar === 2 
                       ? 'border-white bg-gray-800/5 text-gray-800' 
                       : 'border-gray-800/20 text-gray-600 hover:border-gray-800/40'
                   }`}
      >
        2
      </button>
    </div>
  );
};

export default BarSelector; 
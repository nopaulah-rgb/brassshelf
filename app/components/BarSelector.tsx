import React, { useState } from 'react';

const BarSelector: React.FC<{ onSelect: (barCount: number) => void }> = ({ onSelect }) => {
  const [selectedBar, setSelectedBar] = useState<number>(1);

  const handleBarChange = (value: number) => {
    setSelectedBar(value);
    onSelect(value);
  };

  return (
    <div className="bg-[#8BBBD9] rounded-lg p-4">
      <h3 className="text-[#1E3A5F] font-semibold mb-3">Number of Bays:</h3>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((value) => (
          <button
            key={value}
            onClick={() => handleBarChange(value)}
            className={`w-12 h-12 border-2 rounded-lg transition-colors duration-200
                     flex items-center justify-center text-lg font-medium
                     focus:outline-none ${
                       selectedBar === value 
                         ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white' 
                         : 'border-[#1E3A5F]/20 bg-white/60 text-[#1E3A5F] hover:bg-white/80'
                     }`}
          >
            {value}
          </button>
        ))}
        <button
          className="w-12 h-12 border-2 border-[#1E3A5F]/20 bg-white/60 rounded-lg 
                     flex items-center justify-center text-[#1E3A5F] hover:bg-white/80"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default BarSelector; 
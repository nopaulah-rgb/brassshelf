import React, { useState } from 'react';

const RipSelector: React.FC<{ onSelect: (ripUrl: string) => void }> = ({ onSelect }) => {
  const [selectedRip, setSelectedRip] = useState<string | null>(null);

  const ripOptions = [
    { name: '30 cm', url: '/models/30cmRib.stl' },
  ];

  const handleRipSelect = (url: string) => {
    setSelectedRip(url);
    onSelect(url);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {ripOptions.map((rip) => (
        <button
          key={rip.url}
          onClick={() => handleRipSelect(rip.url)}
          className={`h-16 border-2 rounded-lg transition-colors duration-200
                   flex items-center justify-center text-sm
                   focus:outline-none ${
                     selectedRip === rip.url 
                       ? 'border-white bg-gray-800/5 text-gray-800' 
                       : 'border-gray-800/20 text-gray-600 hover:border-gray-800/40'
                   }`}
        >
          {rip.name}
        </button>
      ))}
    </div>
  );
};

export default RipSelector;

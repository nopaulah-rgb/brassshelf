import React, { useState, useEffect } from 'react';

const RipSelector: React.FC<{ onSelect: (ripUrl: string) => void }> = ({ onSelect }) => {
  const [selectedRip, setSelectedRip] = useState<string>('/models/50cmRib.stl');

  const ripOptions = [
    { name: '30 cm', url: '/models/30cmRib.stl' },
    { name: '50 cm', url: '/models/50cmRib.stl' },
  ];

  // Auto-select first rip on mount
  useEffect(() => {
    onSelect(selectedRip);
  }, []);

  const handleRipSelect = (url: string) => {
    setSelectedRip(url);
    onSelect(url);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {ripOptions.map((rip) => (
        <button
          key={rip.url}
          onClick={() => handleRipSelect(rip.url)}
          className={`h-12 border-2 rounded-lg transition-colors duration-200
                   flex items-center justify-center text-sm font-medium
                   focus:outline-none ${
                     selectedRip === rip.url 
                       ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white' 
                       : 'border-[#1E3A5F]/20 bg-white/60 text-[#1E3A5F] hover:bg-white/80'
                   }`}
        >
          {rip.name}
        </button>
      ))}
    </div>
  );
};

export default RipSelector;

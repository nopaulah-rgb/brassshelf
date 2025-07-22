import React, { useState, useEffect } from 'react';

const RipSelector: React.FC<{ onSelect: (ripUrl: string) => void }> = ({ onSelect }) => {
  const [selectedRip, setSelectedRip] = useState<string>('/models/30cmRib.stl');

  const ripOption = { name: '30 cm', url: '/models/30cmRib.stl' };

  // Auto-select the only rip option on mount
  useEffect(() => {
    onSelect(selectedRip);
  }, []);

  return (
    <div className="flex justify-center">
      <div className="h-12 border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white rounded-lg
                      flex items-center justify-center text-sm font-medium px-6">
        {ripOption.name}
      </div>
    </div>
  );
};

export default RipSelector;

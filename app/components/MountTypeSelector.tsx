import React, { useState } from 'react';

interface MountTypeSelectorProps {
  onSelect: (mountType: string) => void;
  onMountTypeChange?: (mountType: string) => void;
}

const MountTypeSelector: React.FC<MountTypeSelectorProps> = ({ onSelect, onMountTypeChange }) => {
  const [selectedMount, setSelectedMount] = useState<string>('ceiling');

  const mountTypes = [
    { id: 'ceiling', name: 'Ceiling' },
    { id: 'ceiling to counter', name: 'Ceiling to Counter' },
    { id: 'ceiling to floor', name: 'Ceiling to Floor' },
    { id: 'wall to counter', name: 'Wall to counter' },
    { id: 'wall', name: 'Wall' },
    { id: 'wall to floor', name: 'Wall to Floor' },
    { id: 'ceiling & counter & wall', name: 'Ceiling & Counter & Wall' },
    { id: 'ceiling & floor & wall', name: 'Ceiling & Floor & Wall' },
  ];

  const handleSelect = (id: string) => {
    const previousMount = selectedMount;
    setSelectedMount(id);
    onSelect(id);
    
    // Call onMountTypeChange if the mount type actually changed
    if (previousMount !== id && onMountTypeChange) {
      onMountTypeChange(id);
    }
  };

  return (
    <div className="bg-[#8BBBD9] rounded-lg p-4">
      <h3 className="text-[#1E3A5F] font-semibold mb-3">Mount Type:</h3>
      <div className="grid grid-cols-2 gap-2">
        {mountTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200
                     focus:outline-none ${
                       selectedMount === type.id 
                         ? 'bg-[#1E3A5F] text-white' 
                         : 'bg-white/60 text-[#1E3A5F] hover:bg-white/80'
                     }`}
          >
            {type.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MountTypeSelector;

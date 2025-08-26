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
    { id: 'ceiling to wall', name: 'Ceiling to Wall' },
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
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Mount Type</h3>
      <div className="grid grid-cols-2 gap-3">
        {mountTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                       selectedMount === type.id 
                         ? 'bg-slate-900 text-white shadow-lg' 
                         : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50'
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

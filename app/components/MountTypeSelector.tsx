import React, { useState } from 'react';

const MountTypeSelector: React.FC<{ onSelect: (mountType: string) => void }> = ({ onSelect }) => {
  const [selectedMount, setSelectedMount] = useState<string>('ceiling');

  const mountTypes = [
    { id: 'ceiling', name: 'Ceiling' },
    { id: 'ceiling to counter', name: 'Ceiling to Counter' },
    { id: 'ceiling to floor', name: 'Ceiling to Floor' },
    { id: 'ceiling to wall', name: 'Ceiling to Wall' },
    { id: 'wall', name: 'Wall' },
    { id: 'wall to floor', name: 'Wall to Floor' },
    { id: 'wall to counter', name: 'Wall to Counter' },
  ];

  const handleSelect = (id: string) => {
    setSelectedMount(id);
    onSelect(id);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {mountTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => handleSelect(type.id)}
          className={`px-4 py-3 border-2 rounded-lg text-left
                   hover:border-gray-800/40 transition-colors duration-200
                   text-sm focus:outline-none ${
                     selectedMount === type.id 
                       ? 'border-white bg-gray-800/5 text-gray-800' 
                       : 'border-gray-800/20 text-gray-600'
                   }`}
        >
          {type.name}
        </button>
      ))}
    </div>
  );
};

export default MountTypeSelector;

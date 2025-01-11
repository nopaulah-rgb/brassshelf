import React from 'react';

interface MountTypeSelectorProps {
  onSelect: (mountType: string) => void;
}

const MountTypeSelector: React.FC<MountTypeSelectorProps> = ({ onSelect }) => {
  const mountTypes = [
    { id: 'ceiling', name: 'Ceiling' },
    { id: 'ceiling to counter', name: 'Ceiling to Counter' },
    { id: 'ceiling to floor', name: 'Ceiling to Floor' },
    { id: 'ceiling to wall', name: 'Ceiling to Wall' },
    { id: 'wall', name: 'Wall' },
    { id: 'wall to floor', name: 'Wall to Floor' },
    { id: 'wall to counter', name: 'Wall to Counter' },
  ];

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Select Mount Type:</h3>
      <select
        className="w-full p-2 border rounded-md"
        onChange={(e) => onSelect(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          Select mount type
        </option>
        {mountTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MountTypeSelector;

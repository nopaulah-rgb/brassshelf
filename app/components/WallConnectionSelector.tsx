import React, { useState } from 'react';

interface WallConnectionSelectorProps {
  onSelect: (connectionPoint: string) => void;
  mountType: string;
}

const WallConnectionSelector: React.FC<WallConnectionSelectorProps> = ({ onSelect, mountType }) => {
  const [selectedConnection, setSelectedConnection] = useState<string>('all');

  // Only show this selector for wall-related mount types
  const isWallMountType = mountType.includes('wall');

  if (!isWallMountType) {
    return null;
  }

  const connectionPoints = [
    { id: 'all', name: 'All Shelves', description: 'Connect to all shelf levels' },
    { id: 'first', name: '1st Shelf Only', description: 'Connect only to first shelf level' },
    { id: 'second', name: '2nd Shelf Only', description: 'Connect only to second shelf level' },
    { id: 'third', name: '3rd Shelf Only', description: 'Connect only to third shelf level' },
    { id: 'top', name: 'Top Shelf Only', description: 'Connect only to highest shelf' },
  ];

  const handleSelect = (id: string) => {
    setSelectedConnection(id);
    onSelect(id);
  };

  return (
    <div className="bg-[#8BBBD9] rounded-lg p-4">
      <h3 className="text-[#1E3A5F] font-semibold mb-3">Wall Connection Point:</h3>
      <div className="grid grid-cols-1 gap-2">
        {connectionPoints.map((point) => (
          <button
            key={point.id}
            onClick={() => handleSelect(point.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200
                     focus:outline-none text-left ${
                       selectedConnection === point.id 
                         ? 'bg-[#1E3A5F] text-white' 
                         : 'bg-white/60 text-[#1E3A5F] hover:bg-white/80'
                     }`}
          >
            <div className="font-medium">{point.name}</div>
            <div className="text-xs opacity-80">{point.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WallConnectionSelector; 
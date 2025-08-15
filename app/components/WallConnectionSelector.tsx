import React, { useState } from 'react';

interface WallConnectionSelectorProps {
  onSelect: (connectionPoints: string[]) => void;
  mountType: string;
}

const WallConnectionSelector: React.FC<WallConnectionSelectorProps> = ({ onSelect, mountType }) => {
  const [selectedConnections, setSelectedConnections] = useState<string[]>(['all']);

  // Only show this selector for wall-related mount types
  const isWallMountType = mountType.includes('wall');

  if (!isWallMountType) {
    return null;
  }

  const connectionPoints = [
    { id: 'all', name: 'All Shelves', description: 'Connect to all shelf levels' },
    { id: 'first', name: '1st Shelf', description: 'Connect to first shelf level' },
    { id: 'second', name: '2nd Shelf', description: 'Connect to second shelf level' },
    { id: 'third', name: '3rd Shelf', description: 'Connect to third shelf level' },
    { id: 'top', name: 'Top Shelf', description: 'Connect to highest shelf' },
  ];

  const handleSelect = (id: string) => {
    let newSelection: string[];
    
    if (id === 'all') {
      // If "All Shelves" is selected, clear other selections and only select "all"
      newSelection = ['all'];
    } else {
      // If a specific shelf is selected, remove "all" and toggle the specific selection
      const currentSelection = selectedConnections.filter(conn => conn !== 'all');
      
      if (currentSelection.includes(id)) {
        // Remove the selection
        newSelection = currentSelection.filter(conn => conn !== id);
        // If no selections left, default to "all"
        if (newSelection.length === 0) {
          newSelection = ['all'];
        }
      } else {
        // Add the selection
        newSelection = [...currentSelection, id];
      }
    }
    
    setSelectedConnections(newSelection);
    onSelect(newSelection);
  };

  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Wall Connection Point</h3>
      <div className="grid grid-cols-1 gap-3">
        {connectionPoints.map((point) => (
          <button
            key={point.id}
            onClick={() => handleSelect(point.id)}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 text-left ${
                       selectedConnections.includes(point.id)
                         ? 'bg-slate-900 text-white shadow-md' 
                         : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                     }`}
          >
            <div className="font-medium">{point.name}</div>
            <div className="text-xs opacity-80 mt-1">{point.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WallConnectionSelector; 
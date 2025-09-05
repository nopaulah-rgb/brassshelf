import React, { useState } from 'react';

interface WallConnectionSelectorProps {
  onSelect: (connectionPoints: string[]) => void;
  mountType: string;
  shelfQuantity: number;
}

const WallConnectionSelector: React.FC<WallConnectionSelectorProps> = ({ onSelect, mountType, shelfQuantity }) => {
  const [selectedConnections, setSelectedConnections] = useState<string[]>(['all']);

  // Reset selection to 'all' when shelfQuantity changes
  React.useEffect(() => {
    setSelectedConnections(['all']);
    onSelect(['all']);
  }, [shelfQuantity, onSelect]);

  // Helper function to get ordinal suffix
  const getOrdinalSuffix = React.useCallback((num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }, []);

  // Generate connection points dynamically based on shelf quantity
  const connectionPoints = React.useMemo(() => {
    const points = [
      { id: 'all', name: 'All Shelves', description: 'Connect to all shelf levels' }
    ];
    
    // Add individual shelf options based on quantity
    for (let i = 1; i <= shelfQuantity; i++) {
      const isLast = i === shelfQuantity;
      points.push({
        id: isLast ? 'top' : `shelf-${i}`,
        name: isLast ? 'Top Shelf' : `${i}${getOrdinalSuffix(i)} Shelf`,
        description: isLast ? 'Connect to highest shelf' : `Connect to ${i}${getOrdinalSuffix(i)} shelf level`
      });
    }
    
    return points;
  }, [shelfQuantity, getOrdinalSuffix]);

  // Only show this selector for wall-related mount types
  const isWallMountType = mountType.includes('wall');

  if (!isWallMountType) {
    return null;
  }

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
    <div className="bg-white p-6 border border-gray-300">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Wall Connection Point</h3>
      <div className="grid grid-cols-1 gap-3">
        {connectionPoints.map((point) => (
          <button
            key={point.id}
            onClick={() => handleSelect(point.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 text-left ${
                       selectedConnections.includes(point.id)
                         ? 'bg-black text-white' 
                         : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
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
import React, { useState } from 'react';

interface MountTypeSelectorProps {
  onSelect: (mountType: string) => void;
  onMountTypeChange?: (mountType: string) => void;
}

const MountTypeSelector: React.FC<MountTypeSelectorProps> = ({ onSelect, onMountTypeChange }) => {
  const [selectedMounts, setSelectedMounts] = useState<string[]>(['ceiling']);

  const mountTypes = [
    { id: 'ceiling', name: 'Ceiling', icon: '🏠' },
    { id: 'wall', name: 'Wall', icon: '🧱' },
    { id: 'floor', name: 'Floor', icon: '🟫' },
    { id: 'counter', name: 'Counter', icon: '🪑' },
  ];

  // Convert simplified selection to original mount type system
  const convertToOriginalMountType = (selectedMounts: string[]): string => {
    if (selectedMounts.includes('ceiling') && selectedMounts.includes('wall') && selectedMounts.includes('counter')) {
      return 'ceiling & counter & wall';
    }
    
    if (selectedMounts.includes('ceiling') && selectedMounts.includes('wall') && selectedMounts.includes('floor')) {
      return 'ceiling & floor & wall';
    }
    
    if (selectedMounts.includes('ceiling') && selectedMounts.includes('wall')) {
      return 'ceiling to wall';
    }
    
    if (selectedMounts.includes('ceiling') && selectedMounts.includes('floor')) {
      return 'ceiling to floor';
    }
    
    if (selectedMounts.includes('ceiling') && selectedMounts.includes('counter')) {
      return 'ceiling to counter';
    }
    
    if (selectedMounts.includes('wall') && selectedMounts.includes('counter')) {
      return 'wall to counter';
    }
    
    if (selectedMounts.includes('wall') && selectedMounts.includes('floor')) {
      return 'wall to floor';
    }
    
    if (selectedMounts.includes('wall')) {
      return 'wall';
    }
    
    if (selectedMounts.includes('ceiling')) {
      return 'ceiling';
    }
    
    if (selectedMounts.includes('floor')) {
      return 'ceiling to floor';
    }
    
    if (selectedMounts.includes('counter')) {
      return 'ceiling to counter';
    }
    
    return 'ceiling'; // Default fallback
  };

  const handleToggle = (id: string) => {
    let newSelection: string[];
    
    if (id === 'floor' && selectedMounts.includes('counter')) {
      // Can't select floor if counter is already selected
      return;
    } else if (id === 'counter' && selectedMounts.includes('floor')) {
      // Can't select counter if floor is already selected
      return;
    } else if (selectedMounts.includes(id)) {
      // Deselect the mount type
      newSelection = selectedMounts.filter(mount => mount !== id);
      // Ensure at least one mount type is selected
      if (newSelection.length === 0) {
        newSelection = ['ceiling'];
      }
    } else {
      // Select the mount type
      newSelection = [...selectedMounts, id];
    }

    setSelectedMounts(newSelection);
    
    // Convert to original mount type and pass to parent
    const originalMountType = convertToOriginalMountType(newSelection);
    onSelect(originalMountType);
    
    if (onMountTypeChange) {
      onMountTypeChange(originalMountType);
    }
  };

  const isDisabled = (id: string) => {
    if (id === 'floor' && selectedMounts.includes('counter')) return true;
    if (id === 'counter' && selectedMounts.includes('floor')) return true;
    return false;
  };

  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Mount Type</h3>
      <p className="text-sm text-slate-600 mb-4">Select one or more mounting options</p>
      
      <div className="grid grid-cols-2 gap-3">
        {mountTypes.map((type) => {
          const isSelected = selectedMounts.includes(type.id);
          const isDisabledState = isDisabled(type.id);
          
          return (
            <button
              key={type.id}
              onClick={() => handleToggle(type.id)}
              disabled={isDisabledState}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                       ${isDisabledState 
                         ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                         : isSelected 
                           ? 'bg-slate-900 text-white shadow-lg' 
                           : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                       }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-base">{type.icon}</span>
                <span>{type.name}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedMounts.includes('floor') && selectedMounts.includes('counter') && (
        <p className="text-xs text-red-500 mt-2 text-center">
          Floor and Counter cannot be selected simultaneously
        </p>
      )}
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Selected:</strong> {convertToOriginalMountType(selectedMounts)}
        </p>
      </div>
    </div>
  );
};

export default MountTypeSelector;

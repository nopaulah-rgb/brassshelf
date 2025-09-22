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
    { id: 'freestanding', name: 'Freestanding', icon: '🧍' },
  ];

  // Convert simplified selection to original mount type system
  const convertToOriginalMountType = (selectedMounts: string[]): string => {
    if (selectedMounts.includes('freestanding')) {
      if (selectedMounts.includes('wall')) return 'freestanding to wall';
      return 'freestanding';
    }
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
    
    if (id === 'freestanding') {
      // Freestanding allows optional wall only; others are cleared
      if (selectedMounts.includes('freestanding')) {
        // Toggling off freestanding -> default back to ceiling
        newSelection = ['ceiling'];
      } else {
        newSelection = ['freestanding'];
      }
      setSelectedMounts(newSelection);
      const originalMountType = convertToOriginalMountType(newSelection);
      onSelect(originalMountType);
      if (onMountTypeChange) onMountTypeChange(originalMountType);
      return;
    }

    // If any other option is selected while freestanding is active, only allow wall
    if (selectedMounts.includes('freestanding')) {
      if (id !== 'wall') {
        // Disallow selecting anything other than wall with freestanding
        return;
      }
      newSelection = [...selectedMounts];
    } else {
      newSelection = [...selectedMounts];
    }

    if (id === 'floor' && selectedMounts.includes('counter')) {
      // Can't select floor if counter is already selected
      return;
    } else if (id === 'counter' && selectedMounts.includes('floor')) {
      // Can't select counter if floor is already selected
      return;
    } else if (newSelection.includes(id)) {
      // Deselect the mount type
      newSelection = newSelection.filter(mount => mount !== id);
      // Ensure at least one mount type is selected
      if (newSelection.length === 0) {
        newSelection = ['ceiling'];
      }
    } else {
      // Select the mount type
      newSelection = [...newSelection, id];
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
    if (selectedMounts.includes('freestanding') && id !== 'freestanding' && id !== 'wall') return true;
    if (id === 'floor' && selectedMounts.includes('counter')) return true;
    if (id === 'counter' && selectedMounts.includes('floor')) return true;
    return false;
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-slate-900 mb-4">Mount Type</h3>
      <p className="text-sm text-slate-600 mb-4">Select one or more mounting options</p>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {mountTypes.map((type) => {
          const isSelected = selectedMounts.includes(type.id);
          const isDisabledState = isDisabled(type.id);
          
          return (
            <label
              key={type.id}
              className={`radio-label ${isSelected ? 'active' : ''} ${isDisabledState ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                className="sr-only"
                name="mounting-type"
                value={type.id}
                checked={isSelected}
                disabled={isDisabledState}
                onChange={() => handleToggle(type.id)}
              />
              {type.name}
            </label>
          );
        })}
      </div>
      
      {selectedMounts.includes('floor') && selectedMounts.includes('counter') && (
        <p className="text-xs text-red-500 mt-2 text-center">
          Floor and Counter cannot be selected simultaneously
        </p>
      )}
    </div>
  );
};

export default MountTypeSelector;

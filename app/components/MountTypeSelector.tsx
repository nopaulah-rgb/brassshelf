import React, { useState, useEffect } from 'react';

interface MountTypeSelectorProps {
  onSelect: (mountType: string) => void;
  onMountTypeChange?: (mountType: string) => void;
  initialMountType?: string; // Başlangıç mount type'ı
}

const MountTypeSelector: React.FC<MountTypeSelectorProps> = ({ onSelect, onMountTypeChange, initialMountType = 'ceiling' }) => {
  const [selectedMounts, setSelectedMounts] = useState<string[]>(['ceiling']);

  // Initialize state based on initial mount type
  useEffect(() => {
    const initialState = convertFromMountType(initialMountType);
    setSelectedMounts(initialState);
  }, [initialMountType]);

  // Reverse conversion: mount type string'den checkbox state'e
  const convertFromMountType = (mountType: string): string[] => {
    switch (mountType) {
      case 'ceiling': return ['ceiling'];
      case 'wall': return ['wall'];
      case 'freestanding': return ['freestanding'];
      case 'ceiling to wall': return ['ceiling', 'wall'];
      case 'ceiling to floor': return ['ceiling', 'floor'];
      case 'ceiling to counter': return ['ceiling', 'counter'];
      case 'wall to counter': return ['wall', 'counter'];
      case 'wall to floor': return ['wall', 'floor'];
      case 'ceiling & counter & wall': return ['ceiling', 'counter', 'wall'];
      case 'ceiling & floor & wall': return ['ceiling', 'floor', 'wall'];
      case 'freestanding to wall': return ['freestanding', 'wall'];
      default: return ['ceiling'];
    }
  };

  const mountTypes = [
    { id: 'ceiling', name: 'Ceiling' },
    { id: 'wall', name: 'Wall' },
    { id: 'floor', name: 'Floor' },
    { id: 'counter', name: 'Counter' },
    { id: 'freestanding', name: 'Freestanding' },
  ];

  // Convert multiple selection to mount type string
  const convertToMountType = (selectedMounts: string[]): string => {
    const sorted = [...selectedMounts].sort();
    
    // Freestanding kombinasyonları
    if (sorted.includes('freestanding')) {
      if (sorted.includes('wall')) return 'freestanding to wall';
      return 'freestanding';
    }
    
    // 3'lü kombinasyonlar
    if (sorted.includes('ceiling') && sorted.includes('counter') && sorted.includes('wall')) {
      return 'ceiling & counter & wall';
    }
    if (sorted.includes('ceiling') && sorted.includes('floor') && sorted.includes('wall')) {
      return 'ceiling & floor & wall';
    }
    
    // 2'li kombinasyonlar
    if (sorted.includes('ceiling') && sorted.includes('wall')) {
      return 'ceiling to wall';
    }
    if (sorted.includes('ceiling') && sorted.includes('floor')) {
      return 'ceiling to floor';
    }
    if (sorted.includes('ceiling') && sorted.includes('counter')) {
      return 'ceiling to counter';
    }
    if (sorted.includes('wall') && sorted.includes('counter')) {
      return 'wall to counter';
    }
    if (sorted.includes('wall') && sorted.includes('floor')) {
      return 'wall to floor';
    }
    
    // Tek seçimler
    if (sorted.includes('wall')) return 'wall';
    if (sorted.includes('ceiling')) return 'ceiling';
    if (sorted.includes('floor')) return 'ceiling to floor'; // Floor tek başına ceiling to floor olur
    if (sorted.includes('counter')) return 'ceiling to counter'; // Counter tek başına ceiling to counter olur
    
    return 'ceiling'; // Default fallback
  };

  // Get current mount type string for display
  const getCurrentMountTypeDisplay = (): string => {
    const mountType = convertToMountType(selectedMounts);
    return mountType.charAt(0).toUpperCase() + mountType.slice(1);
  };

  const handleToggle = (id: string) => {
    let newSelection = [...selectedMounts];
    
    // Freestanding özel mantığı
    if (id === 'freestanding') {
      if (selectedMounts.includes('freestanding')) {
        // Freestanding'i kaldır ve ceiling'e dön
        newSelection = ['ceiling'];
      } else {
        // Freestanding seç ve diğerlerini temizle (sadece wall kalabilir)
        newSelection = ['freestanding'];
        if (selectedMounts.includes('wall')) {
          newSelection.push('wall');
        }
      }
    } else if (selectedMounts.includes('freestanding') && id !== 'wall') {
      // Freestanding seçiliyken sadece wall eklenebilir
      return;
    } else {
      // Normal toggle mantığı
      if (newSelection.includes(id)) {
        // Seçimi kaldır
        newSelection = newSelection.filter(mount => mount !== id);
        // En az bir seçim olmalı
        if (newSelection.length === 0) {
          newSelection = ['ceiling'];
        }
      } else {
        // Yeni seçim ekle
        newSelection.push(id);
      }
      
      // Floor ve Counter aynı anda seçilemez
      if (newSelection.includes('floor') && newSelection.includes('counter')) {
        if (id === 'floor') {
          newSelection = newSelection.filter(mount => mount !== 'counter');
        } else if (id === 'counter') {
          newSelection = newSelection.filter(mount => mount !== 'floor');
        }
      }
    }

    setSelectedMounts(newSelection);
    
    // Convert to mount type string and notify parent
    const mountType = convertToMountType(newSelection);
    onSelect(mountType);
    
    if (onMountTypeChange) {
      onMountTypeChange(mountType);
    }
  };

  const isDisabled = (id: string) => {
    // Freestanding seçiliyken sadece wall seçilebilir
    if (selectedMounts.includes('freestanding') && id !== 'freestanding' && id !== 'wall') {
      return true;
    }
    // Floor ve Counter aynı anda seçilemez
    if (id === 'floor' && selectedMounts.includes('counter')) return true;
    if (id === 'counter' && selectedMounts.includes('floor')) return true;
    return false;
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-slate-900 mb-4">Mount Type</h3>
      <p className="text-sm text-slate-600 mb-4">Select one or more mounting options</p>
      
      {/* Current selection display */}
      <div className="mb-4 p-3 bg-[#f4f3f0] rounded-lg border border-[#ec9513]">
        <div className="text-sm font-medium text-[#ec9513]">Selected Configuration:</div>
        <div className="text-lg font-bold text-slate-900">{getCurrentMountTypeDisplay()}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {mountTypes.map((type) => {
          const isSelected = selectedMounts.includes(type.id);
          const isDisabledState = isDisabled(type.id);
          
          return (
            <label
              key={type.id}
              className={`
                border rounded-lg p-3 cursor-pointer transition-all duration-200 text-center
                ${isSelected 
                  ? 'border-2 border-[#ec9513] bg-[#f4f3f0] text-[#ec9513]' 
                  : 'border border-gray-200 hover:border-[#ec9513] text-slate-900'
                }
                ${isDisabledState ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="checkbox"
                className="sr-only"
                name="mounting-type"
                value={type.id}
                checked={isSelected}
                disabled={isDisabledState}
                onChange={() => !isDisabledState && handleToggle(type.id)}
              />
              <div className="font-medium text-sm">{type.name}</div>
              {isSelected && (
                <div className="mt-1">
                  <div className="w-2 h-2 bg-[#ec9513] rounded-full mx-auto"></div>
                </div>
              )}
            </label>
          );
        })}
      </div>
      
      {/* Quick select dropdown for common combinations */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label htmlFor="preset-select" className="block text-sm font-medium text-slate-700 mb-2">
          Or select a preset combination:
        </label>
        <select 
          id="preset-select" 
          className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#ec9513] focus:ring-1 focus:ring-[#ec9513]"
          value={convertToMountType(selectedMounts)}
          onChange={(e) => {
            const newMountType = e.target.value;
            const newSelections = convertFromMountType(newMountType);
            setSelectedMounts(newSelections);
            onSelect(newMountType);
            if (onMountTypeChange) onMountTypeChange(newMountType);
          }}
        >
          <option value="ceiling">Ceiling Only</option>
          <option value="wall">Wall Only</option>
          <option value="freestanding">Freestanding Only</option>
          <option value="ceiling to wall">Ceiling to Wall</option>
          <option value="ceiling to floor">Ceiling to Floor</option>
          <option value="ceiling to counter">Ceiling to Counter</option>
          <option value="wall to counter">Wall to Counter</option>
          <option value="wall to floor">Wall to Floor</option>
          <option value="ceiling & counter & wall">Ceiling + Counter + Wall</option>
          <option value="ceiling & floor & wall">Ceiling + Floor + Wall</option>
          <option value="freestanding to wall">Freestanding to Wall</option>
        </select>
      </div>
      
      {/* Constraint warnings */}
      {selectedMounts.includes('freestanding') && (
        <p className="text-xs text-blue-600 mt-2 text-center">
          💡 Freestanding mode: Only Wall can be added for additional support
        </p>
      )}
      
      {(selectedMounts.includes('floor') && selectedMounts.includes('counter')) && (
        <p className="text-xs text-red-500 mt-2 text-center">
          ⚠️ Floor and Counter cannot be selected together
        </p>
      )}
    </div>
  );
};

export default MountTypeSelector;
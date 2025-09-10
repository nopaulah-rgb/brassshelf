import React from 'react';

interface BackVerticalSelectorProps {
  mountType: string;
  backVertical: boolean;
  onChange: (backVertical: boolean) => void;
}

const BackVerticalSelector: React.FC<BackVerticalSelectorProps> = ({ mountType, backVertical, onChange }) => {
  // Only show for wall mount types that support back vertical connections
  const supportedMountTypes = [
    'wall',
    'wall to counter',
    'wall to floor', 
    'ceiling to wall',
    'ceiling floor wall',
    'ceiling to counter to wall'
  ];
  
  if (!supportedMountTypes.includes(mountType)) {
    return null;
  }

  return (
    <div className="bg-white p-6 border border-gray-300">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Back Vertical Connection</h3>
      <p className="text-sm text-slate-600 mb-4">Choose whether to use vertical connections at the back</p>
      
      <div className="flex gap-3">
        <button
          onClick={() => onChange(true)}
          className={`flex-1 px-4 py-3 border transition-colors duration-200 ${
            backVertical
              ? 'border-black bg-black text-white'
              : 'border-gray-300 text-gray-800 bg-white hover:bg-gray-100'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`flex-1 px-4 py-3 border transition-colors duration-200 ${
            !backVertical
              ? 'border-black bg-black text-white'
              : 'border-gray-300 text-gray-800 bg-white hover:bg-gray-100'
          }`}
        >
          No
        </button>
      </div>
      
      <p className="text-sm text-slate-500 italic mt-4">
        {backVertical 
          ? "Standard wall connection models (Type16F) will be used" 
          : "Type16E models will be used for wall connections instead of Type16F"}
      </p>
    </div>
  );
};

export default BackVerticalSelector;

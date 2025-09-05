import React from 'react';

interface UseTopShelfSelectorProps {
  mountType: string;
  useTopShelf: boolean;
  onChange: (useTop: boolean) => void;
}

const UseTopShelfSelector: React.FC<UseTopShelfSelectorProps> = ({ mountType, useTopShelf, onChange }) => {
  // Only show for wall mount types (wall, wall to floor, wall to counter)
  if (mountType !== 'wall to floor' && mountType !== 'wall to counter' && mountType !== 'wall') {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-900">Top Shelf Option</h3>
      
      <div className="flex gap-3">
        <button
          onClick={() => onChange(false)}
          className={`flex-1 px-4 py-3 border transition-colors duration-200 ${
            !useTopShelf
              ? 'border-black bg-black text-white'
              : 'border-gray-300 text-gray-800 bg-white hover:bg-gray-100'
          }`}
        >
          Do not use top as shelf
        </button>
        <button
          onClick={() => onChange(true)}
          className={`flex-1 px-4 py-3 border transition-colors duration-200 ${
            useTopShelf
              ? 'border-black bg-black text-white'
              : 'border-gray-300 text-gray-800 bg-white hover:bg-gray-100'
          }`}
        >
          Use top as shelf
        </button>
      </div>
      
      <p className="text-sm text-slate-500 italic">
        {useTopShelf 
          ? "A shelf will be placed at the top of your unit" 
          : "No shelf will be placed at the top of your unit"}
      </p>
    </div>
  );
};

export default UseTopShelfSelector; 
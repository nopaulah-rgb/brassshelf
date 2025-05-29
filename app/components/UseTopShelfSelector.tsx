import React from 'react';

interface UseTopShelfSelectorProps {
  mountType: string;
  useTopShelf: boolean;
  onChange: (useTop: boolean) => void;
}

const UseTopShelfSelector: React.FC<UseTopShelfSelectorProps> = ({ mountType, useTopShelf, onChange }) => {
  // Only show for wall to floor and wall to counter mount types
  if (mountType !== 'wall to floor' && mountType !== 'wall to counter') {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <button
          onClick={() => onChange(false)}
          className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
            !useTopShelf
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400 text-gray-700'
          }`}
        >
          Do not use top as shelf
        </button>
        <button
          onClick={() => onChange(true)}
          className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
            useTopShelf
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400 text-gray-700'
          }`}
        >
          Use top as shelf
        </button>
      </div>
      <p className="text-sm text-gray-500 italic">
        {useTopShelf 
          ? "A shelf will be placed at the top of your unit" 
          : "No shelf will be placed at the top of your unit"}
      </p>
    </div>
  );
};

export default UseTopShelfSelector; 
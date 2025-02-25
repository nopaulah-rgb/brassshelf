/* eslint-disable jsx-a11y/label-has-associated-control */

import React from 'react';

interface CrossbarSelectorProps {
  showCrossbars: boolean;
  onChange: (value: boolean) => void;
}

const CrossbarSelector: React.FC<CrossbarSelectorProps> = ({ showCrossbars, onChange }) => {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onChange(true)}
        className={`flex-1 h-16 border-2 rounded-lg transition-colors duration-200
                   flex items-center justify-center text-lg
                   focus:outline-none ${
                     showCrossbars 
                       ? 'border-white bg-gray-800/5 text-gray-800' 
                       : 'border-gray-800/20 text-gray-600 hover:border-gray-800/40'
                   }`}
      >
        Yes
      </button>
      <button
        onClick={() => onChange(false)}
        className={`flex-1 h-16 border-2 rounded-lg transition-colors duration-200
                   flex items-center justify-center text-lg
                   focus:outline-none ${
                     !showCrossbars 
                       ? 'border-gray-800 bg-gray-800/5 text-gray-800' 
                       : 'border-gray-800/20 text-gray-600 hover:border-gray-800/40'
                   }`}
      >
        No
      </button>
    </div>
  );
};

export default CrossbarSelector; 
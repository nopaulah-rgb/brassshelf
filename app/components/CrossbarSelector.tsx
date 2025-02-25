/* eslint-disable jsx-a11y/label-has-associated-control */

import React from 'react';

interface CrossbarSelectorProps {
  showCrossbars: boolean;
  onChange: (value: boolean) => void;
}

const CrossbarSelector: React.FC<CrossbarSelectorProps> = ({ showCrossbars, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-medium text-gray-900">
        Would you like horizontal cross bars?
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onChange(true)}
          className={`border-2 py-4 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900
            ${showCrossbars 
              ? 'border-gray-900 bg-gray-900 text-white' 
              : 'border-gray-900 hover:bg-gray-100'}`}
        >
          <span className="text-lg font-medium">Yes</span>
        </button>
        <button
          onClick={() => onChange(false)}
          className={`border-2 py-4 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900
            ${!showCrossbars 
              ? 'border-gray-900 bg-gray-900 text-white' 
              : 'border-gray-900 hover:bg-gray-100'}`}
        >
          <span className="text-lg font-medium">No</span>
        </button>
      </div>
    </div>
  );
};

export default CrossbarSelector; 
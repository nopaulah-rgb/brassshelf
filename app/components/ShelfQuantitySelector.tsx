import React, { useState } from 'react';

const ShelfQuantitySelector: React.FC<{ onSelect: (quantity: number) => void }> = ({ onSelect }) => {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  const handleSelect = (quantity: number) => {
    setSelectedQuantity(quantity);
    onSelect(quantity);
  };

  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Number of Shelves</h3>
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((quantity) => (
          <button
            key={quantity}
            onClick={() => handleSelect(quantity)}
            className={`w-14 h-14 border-2 rounded-xl transition-all duration-200
                     flex items-center justify-center text-lg font-medium
                     focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                       selectedQuantity === quantity 
                         ? 'border-slate-900 bg-slate-900 text-white shadow-lg' 
                         : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                     }`}
          >
            {quantity}
          </button>
        ))}
        <button
          className="w-14 h-14 border-2 border-slate-300 bg-white rounded-xl 
                     flex items-center justify-center text-slate-700 hover:border-slate-400 hover:bg-slate-50
                     transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ShelfQuantitySelector;

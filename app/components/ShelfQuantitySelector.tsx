import React, { useState } from 'react';

const ShelfQuantitySelector: React.FC<{ onSelect: (quantity: number) => void }> = ({ onSelect }) => {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  const handleSelect = (quantity: number) => {
    setSelectedQuantity(quantity);
    onSelect(quantity);
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {[1, 2, 3, 4, 5].map((quantity) => (
        <button
          key={quantity}
          onClick={() => handleSelect(quantity)}
          className={`h-14 border-2 rounded-lg
                   hover:border-gray-800/40 transition-colors duration-200
                   flex items-center justify-center text-lg
                   focus:outline-none ${
                     selectedQuantity === quantity 
                       ? 'border-white bg-gray-800/5 text-gray-800' 
                       : 'border-gray-800/20 text-gray-600'
                   }`}
        >
          {quantity}
        </button>
      ))}
    </div>
  );
};

export default ShelfQuantitySelector;

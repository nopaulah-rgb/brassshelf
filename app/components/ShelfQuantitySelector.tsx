import React from 'react';

const ShelfQuantitySelector: React.FC<{ onSelect: (quantity: number) => void }> = ({ onSelect }) => {
  return (
    <div>
    <h3 className="text-lg font-medium mb-2">Select Number of Shelves:</h3>
    <select
      className="w-full p-2 border rounded-md"
      onChange={(e) => onSelect(Number(e.target.value))}
    >
      {[1, 2, 3, 4, 5].map((quantity) => (
        <option key={quantity} value={quantity}>
          {quantity}
        </option>
      ))}
    </select>
  </div>
  );
};

export default ShelfQuantitySelector;

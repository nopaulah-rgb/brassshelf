import React from 'react';

const ShelfQuantitySelector: React.FC<{ onSelect: (quantity: number) => void }> = ({ onSelect }) => {
  return (
    <div>
      <label htmlFor="shelf-quantity-select">Select Number of Shelves: </label>
      <select id="shelf-quantity-select" onChange={(e) => onSelect(Number(e.target.value))}>
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

import React, { useState } from 'react';

const ShelfQuantitySelector: React.FC<{ onSelect: (quantity: number) => void }> = ({ onSelect }) => {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  const handleSelect = (quantity: number) => {
    setSelectedQuantity(quantity);
    onSelect(quantity);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium" htmlFor="shelves">Number of Shelves</label>
      <input
        className="form-input"
        id="shelves"
        type="number"
        value={selectedQuantity}
        onChange={(e) => handleSelect(Number(e.target.value))}
        min="1"
        max="20"
        placeholder="e.g., 5"
      />
    </div>
  );
};

export default ShelfQuantitySelector;

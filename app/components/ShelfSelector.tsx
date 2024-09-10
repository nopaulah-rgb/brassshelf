import React from 'react';

const ShelfSelector: React.FC<{ onSelect: (shelfModelUrl: string) => void }> = ({ onSelect }) => {
  const shelves = [
    { name: 'Glass Shelf', url: 'app/models/glassShelf.stl' },
    { name: 'Wooden Shelf', url: 'app/models/woodenShelf.stl' },
  ];

  return (
    <div>
      <label htmlFor="shelf-select">Select a Shelf: </label>
      <select id="shelf-select" onChange={(e) => onSelect(e.target.value)}>
        <option value="">--Select a Shelf--</option>
        {shelves.map((shelf) => (
          <option key={shelf.name} value={shelf.url}>
            {shelf.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ShelfSelector;

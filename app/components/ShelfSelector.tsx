import React from 'react';

const ShelfSelector: React.FC<{ onSelect: (shelfModelUrl: string) => void }> = ({ onSelect }) => {
  const shelves = [
    { name: 'Glass Shelf', url: '/models/glassShelf.stl' },
    { name: 'Wooden Shelf', url: '/models/woodenShelf.stl' },
  ];

  return (
    <div>
    <h3 className="text-lg font-medium mb-2">Select a Shelf:</h3>
    <select
      className="w-full p-2 border rounded-md"
      onChange={(e) => onSelect(e.target.value)}
    >
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

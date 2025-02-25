import React from 'react';

const ShelfSelector: React.FC<{ onSelect: (shelfModelUrl: string) => void }> = ({ onSelect }) => {
  const shelves = [
    { name: 'Glass Shelf', url: '/models/glassShelf.stl' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-medium text-gray-900">
        Select a Shelf:
      </h3>
      <div className="relative">
        <select
          className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900 text-lg"
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="">--Select a Shelf--</option>
          {shelves.map((shelf) => (
            <option key={shelf.name} value={shelf.url}>
              {shelf.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ShelfSelector;

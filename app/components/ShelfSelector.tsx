/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';

const ShelfSelector: React.FC<{ onSelect: (shelfUrl: string) => void }> = ({ onSelect }) => {
  const glassShelfUrl = '/models/glassShelf.stl';
  
  // Component mount olduğunda otomatik olarak Glass Shelf'i seç
  React.useEffect(() => {
    onSelect(glassShelfUrl);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-3">
      <button
        className="px-6 py-4 border-2 rounded-lg text-left
                 border-white bg-gray-800/5 text-gray-800
                 text-lg focus:outline-none"
      >
        Glass Shelf
      </button>
    </div>
  );
};

export default ShelfSelector;

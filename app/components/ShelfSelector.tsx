/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';

interface ShelfSelectorProps {
  onSelect: (shelfUrl: string) => void;
  shelfMaterial: string;
}

const ShelfSelector: React.FC<ShelfSelectorProps> = ({ onSelect, shelfMaterial }) => {
  const glassShelfUrl = '/models/Glass Shelf v1_B.glb';
  const woodShelfUrl = '/models/woodenShelf.stl';
  
  // Update shelf URL when material changes
  React.useEffect(() => {
    if (shelfMaterial === 'glass') {
      onSelect(glassShelfUrl);
    } else if (shelfMaterial === 'wood') {
      onSelect(woodShelfUrl);
    }
  }, [shelfMaterial]);

  return null; // This component is now just a logic handler
};

export default ShelfSelector;

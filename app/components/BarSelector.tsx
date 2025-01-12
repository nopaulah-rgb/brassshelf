import React, { useState } from 'react';

interface BarSelectorProps {
  onSelect: (barCount: number) => void;
}

const BarSelector: React.FC<BarSelectorProps> = ({ onSelect }) => {
  const [selectedBar, setSelectedBar] = useState<number>(1);

  const handleBarChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    setSelectedBar(value);
    onSelect(value);
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Select Bays</h3>
      <select
        className="w-full p-2 border rounded-md"
        value={selectedBar}
        onChange={handleBarChange}
      >
        <option value={1}>1</option>
        <option value={2}>2</option>
      </select>
    </div>
  );
};

export default BarSelector; 
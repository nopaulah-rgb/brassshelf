import React, { useState } from 'react';

interface RipSelectorProps {
  onSelect: (ripUrl: string) => void;
}

const RipSelector: React.FC<RipSelectorProps> = ({ onSelect }) => {
  const [selectedRip, setSelectedRip] = useState<string | null>(null);

  const ripOptions = [
    { name: '30 cm', url: '/models/30cmRib.stl' },
    { name: '50 cm', url: '/models/50cmRib.stl' },
  ];

  const handleRipChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = event.target.value;
    setSelectedRip(selectedUrl);
    onSelect(selectedUrl);
  };

  return (
    <div>
    <h3 className="text-lg font-medium mb-2">Select a Rip:</h3>
    <select
      className="w-full p-2 border rounded-md"
      value={selectedRip || ''}
      onChange={handleRipChange}
    >
      <option value="" disabled>
        Select a rip
      </option>
      {ripOptions.map((rip) => (
        <option key={rip.url} value={rip.url}>
          {rip.name}
        </option>
      ))}
    </select>
  </div>
  );
};

export default RipSelector;

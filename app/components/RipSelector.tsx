import React, { useState } from 'react';

interface RipSelectorProps {
  onSelect: (ripUrl: string) => void;
}

const RipSelector: React.FC<RipSelectorProps> = ({ onSelect }) => {
  const [selectedRip, setSelectedRip] = useState<string | null>(null);

  const ripOptions = [
    { name: '30 cm', url: 'app/models/30cmRib.stl' },
    { name: '50 cm', url: 'app/models/50cmRib.stl' },
  ];

  const handleRipChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = event.target.value;
    setSelectedRip(selectedUrl);
    onSelect(selectedUrl);
  };

  return (
    <div>
      <label htmlFor="rip-select">Select a Rip:</label>
      <select id="rip-select" value={selectedRip || ''} onChange={handleRipChange}>
        <option value="" disabled>Select a rip</option>
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

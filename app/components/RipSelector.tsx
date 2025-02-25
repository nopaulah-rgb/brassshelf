import React, { useState } from 'react';

interface RipSelectorProps {
  onSelect: (ripUrl: string) => void;
}

const RipSelector: React.FC<RipSelectorProps> = ({ onSelect }) => {
  const [selectedRip, setSelectedRip] = useState<string | null>(null);

  const ripOptions = [
    { name: '30 cm', url: '/models/30cmRib.stl' },
  ];

  const handleRipChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = event.target.value;
    setSelectedRip(selectedUrl);
    onSelect(selectedUrl);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-medium text-gray-900">
        Select a Rip:
      </h3>
      <div className="relative">
        <select
          className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900 text-lg"
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
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default RipSelector;

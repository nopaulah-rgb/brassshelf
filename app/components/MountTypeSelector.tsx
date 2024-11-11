import React, { memo } from 'react';

interface MountTypeSelectorProps {
  onSelect: (modelPath: string) => void;
}

const MOUNT_OPTIONS: string[] = [
  "ceiling",
  "ceiling to wall",
  "ceiling to floor",
  "wall",
  "wall to floor",
  "ceiling to counter",
  "wall to counter",
];

// Define which mount types use the `roomEmpty.stl` vs `roomCabinet.stl`
const ROOM_EMPTY_MODELS = ["ceiling", "ceiling to wall", "ceiling to floor", "wall", "wall to floor"];

const MountTypeSelector: React.FC<MountTypeSelectorProps> = ({ onSelect }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    
    // Determine the file path based on the mount type selection
    const model = ROOM_EMPTY_MODELS.includes(selectedType)
      ? "/models/roomEmpty.stl"
      : "/models/roomCabinet.stl";
      
    onSelect(model);
  };

  return (
    <div className="mb-4">
      <label htmlFor="mountType" className="block mb-2 font-semibold">
        Select Mount Type
      </label>
      <select id="mountType" className="border p-2 w-full" onChange={handleChange} defaultValue="">
        <option value="" disabled>Select Mount Type</option>
        {MOUNT_OPTIONS.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};

MountTypeSelector.displayName = "MountTypeSelector";

export default memo(MountTypeSelector);

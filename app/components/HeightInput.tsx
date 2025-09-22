import React from "react";

interface HeightInputProps {
  mountType: string;
  value: number; // Value in mm
  onChange: (height: number) => void; // Height in mm
}

const HeightInput: React.FC<HeightInputProps> = ({
  mountType,
  value,
  onChange,
}) => {
  // Only show for wall to floor and wall to counter mount types
  if (mountType !== "wall to floor" && mountType !== "wall to counter") {
    return null;
  }

  // Convert mm to inches for display
  const inchValue = Number((value / 25.4).toFixed(1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inches = parseFloat(e.target.value);
    if (!isNaN(inches) && inches >= 0) {
      // Convert inches to mm for internal state
      const mm = Math.round(inches * 25.4);
      onChange(mm);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      <label
        htmlFor="heightInput"
        className="text-sm font-medium text-gray-700"
      >
        {mountType === "wall to floor"
          ? "Floor to Top Height (inches)"
          : "Counter to Top Height (inches)"}
        :
      </label>
      <div>
        <input
          id="heightInput"
          type="number"
          min="0"
          step="0.1"
          value={inchValue}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter height in inches"
        />
        <p className="text-xs text-slate-500 mt-1">
          Enter measurement in decimal inches (e.g., 42.625)
        </p>
      </div>
    </div>
  );
};

export default HeightInput;

import React from 'react';

interface CrossbarSelectorProps {
  showCrossbars: boolean;
  onChange: (value: boolean) => void;
}

export function CrossbarSelector({ showCrossbars, onChange }: CrossbarSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-lg font-medium text-gray-900">
        Horizontal Cross Bars:
      </label>
      <select
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={showCrossbars.toString()}
        onChange={(e) => onChange(e.target.value === 'true')}
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </div>
  );
} 
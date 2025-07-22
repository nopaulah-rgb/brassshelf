import React from 'react';

interface PipeDiameterSelectorProps {
  pipeDiameter: string;
  onChange: (diameter: string) => void;
}

const PipeDiameterSelector: React.FC<PipeDiameterSelectorProps> = ({
  pipeDiameter,
  onChange,
}) => {
  return (
    <div className="bg-[#8BBBD9] rounded-lg p-4">
      <h3 className="text-[#1E3A5F] font-semibold mb-3">Pipe Diameter:</h3>
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="pipeDiameter"
            value="5/8"
            checked={pipeDiameter === '5/8'}
            onChange={() => onChange('5/8')}
            className="w-4 h-4 text-[#1E3A5F] bg-white border-[#1E3A5F] focus:ring-[#1E3A5F]"
          />
          <span className="text-[#1E3A5F]">5/8" (16mm)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="pipeDiameter"
            value="1"
            checked={pipeDiameter === '1'}
            onChange={() => onChange('1')}
            className="w-4 h-4 text-[#1E3A5F] bg-white border-[#1E3A5F] focus:ring-[#1E3A5F]"
          />
          <span className="text-[#1E3A5F]">1" (25 mm)</span>
        </label>
      </div>
    </div>
  );
};

export default PipeDiameterSelector; 
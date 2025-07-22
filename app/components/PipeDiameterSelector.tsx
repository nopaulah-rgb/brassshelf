import React from 'react';

interface PipeDiameterSelectorProps {
  pipeDiameter: string;
  onChange: (diameter: string) => void;
}

const PipeDiameterSelector: React.FC<PipeDiameterSelectorProps> = ({
  pipeDiameter,
  onChange,
}) => {
  // Auto-set to 5/8" if not already set
  React.useEffect(() => {
    if (pipeDiameter !== '5/8') {
      onChange('5/8');
    }
  }, [pipeDiameter, onChange]);

  return (
    <div className="bg-[#8BBBD9] rounded-lg p-4">
      <h3 className="text-[#1E3A5F] font-semibold mb-3">Pipe Diameter:</h3>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-[#1E3A5F] rounded-full"></div>
        <span className="text-[#1E3A5F]">5/8" (16mm)</span>
      </div>
    </div>
  );
};

export default PipeDiameterSelector; 
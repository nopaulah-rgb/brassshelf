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
    <div className="bg-white p-6 border border-gray-300">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Pipe Diameter</h3>
      <div className="flex items-center gap-4">
        <div className="w-5 h-5 bg-black"></div>
        <div>
          <span className="text-gray-900 font-medium">5/8" (16mm)</span>
          <p className="text-gray-600 text-sm mt-1">Standard brass tube diameter</p>
        </div>
      </div>
    </div>
  );
};

export default PipeDiameterSelector; 
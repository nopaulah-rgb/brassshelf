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
    <div>
      <label className="mb-2 block text-sm font-medium">Pipe Diameter</label>
      <div className="flex flex-wrap gap-4">
        <label className={`radio-label ${pipeDiameter === '5/8' ? 'active' : ''}`}>
          <input
            className="sr-only"
            name="pipe-diameter"
            type="radio"
            value="5/8"
            checked={pipeDiameter === '5/8'}
            onChange={() => onChange('5/8')}
          />
          5/8"
        </label>
        <label className={`radio-label ${pipeDiameter === '1' ? 'active' : ''}`}>
          <input
            className="sr-only"
            name="pipe-diameter"
            type="radio"
            value="1"
            checked={pipeDiameter === '1'}
            onChange={() => onChange('1')}
          />
          1"
        </label>
      </div>
    </div>
  );
};

export default PipeDiameterSelector; 
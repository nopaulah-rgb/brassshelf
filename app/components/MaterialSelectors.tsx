import React from 'react';

interface MaterialSelectorsProps {
  finish: string;
  onFinishChange: (value: string) => void;
}

const MaterialSelectors: React.FC<MaterialSelectorsProps> = ({
  finish,
  onFinishChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Finish Section */}
      <div className="bg-[#8BBBD9] rounded-lg p-4">
        <h3 className="text-[#1E3A5F] font-semibold mb-3">Finish:</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="finish"
              value="polished"
              checked={finish === 'polished'}
              onChange={() => onFinishChange('polished')}
              className="w-4 h-4 text-[#1E3A5F] bg-white border-[#1E3A5F] focus:ring-[#1E3A5F]"
            />
            <span className="text-[#1E3A5F]">Unlacquered Polished Brass</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="finish"
              value="satin"
              checked={finish === 'satin'}
              onChange={() => onFinishChange('satin')}
              className="w-4 h-4 text-[#1E3A5F] bg-white border-[#1E3A5F] focus:ring-[#1E3A5F]"
            />
            <span className="text-[#1E3A5F]">Unlacquered Satin (Brushed) Brass</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default MaterialSelectors; 
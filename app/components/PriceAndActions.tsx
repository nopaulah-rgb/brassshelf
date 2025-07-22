import React from 'react';

interface PriceAndActionsProps {
  price: number;
  onExport: () => void;
  onAddToCart: () => void;
}

const PriceAndActions: React.FC<PriceAndActionsProps> = ({
  price,
  onExport,
  onAddToCart,
}) => {
  return (
    <div className="space-y-4">
      {/* Price Display */}
      <div className="bg-white rounded-lg p-6 shadow-lg text-center">
        <span className="text-sm text-gray-600">Price:</span>
        <h2 className="text-3xl font-bold text-gray-900">${price.toFixed(0)}</h2>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onExport}
          className="w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Export
        </button>
        
        <button
          onClick={onAddToCart}
          className="w-full py-3 px-4 bg-[#1E3A5F] text-white rounded-lg font-medium hover:bg-[#152844] transition-colors"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default PriceAndActions; 
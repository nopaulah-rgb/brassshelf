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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      {/* Price Display */}
      <div className="text-center mb-8 pb-6 border-b border-gray-200">
        <span className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Price</span>
        <h2 className="text-4xl font-light text-slate-900 mt-2">${price.toFixed(0)}</h2>
        <p className="text-slate-500 text-sm mt-2">USD</p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={onExport}
          className="w-full py-4 px-6 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all duration-200 border border-slate-200 hover:border-slate-300"
        >
          Export Configuration
        </button>
        
        <button
          onClick={onAddToCart}
          className="w-full py-4 px-6 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Add to Cart
        </button>
      </div>
      
      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center text-slate-500 text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Lead time: 6-8 weeks after payment</span>
        </div>
      </div>
    </div>
  );
};

export default PriceAndActions; 
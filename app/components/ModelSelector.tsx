import React, { useState } from 'react';

const ModelSelector: React.FC<{ onSelect: (modelUrl: string) => void }> = ({ onSelect }) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const models = [
    { name: 'Model 1', url: 'app/models/model1.stl' },
    { name: 'Model 2', url: 'app/models/model2.stl' },
    { name: 'Model 3', url: 'app/models/model3.stl' },
    { name: 'Model 4', url: 'app/models/model4.stl' },
    { name: 'Model 5', url: 'app/models/model5.stl' },
    { name: 'Model 6', url: 'app/models/model6.stl' },
    { name: 'Model 7', url: 'app/models/model7.stl' },
    { name: 'Model 8', url: 'app/models/model8.stl' },
    { name: 'Model 9', url: 'app/models/model9.stl' },
    { name: 'Model 10', url: 'app/models/model10.stl' },
    { name: 'Model 11', url: 'app/models/model11.stl' },
    { name: 'Model 12', url: 'app/models/model12.stl' },
  ];

  const handleClick = (url: string) => {
    setSelectedModel(url);
    onSelect(url);
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Select a Model:</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {models.map((model) => (
          <button
            key={model.name}
            onClick={() => handleClick(model.url)}
            className={`p-2 border rounded-md text-sm ${
              selectedModel === model.url ? 'bg-gray-400 text-white' : 'bg-white'
            } hover:bg-gray-100`}
          >
            {model.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;

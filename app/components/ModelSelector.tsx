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
      {models.map((model) => (
        <button
          key={model.name}
          onClick={() => handleClick(model.url)}
          style={{ backgroundColor: selectedModel === model.url ? 'gray' : 'initial' }}
        >
          {model.name}
        </button>
      ))}
    </div>
  );
};

export default ModelSelector;

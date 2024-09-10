import { json } from "@remix-run/node";
import { Link, Outlet, useRouteError } from "@remix-run/react";

// Components
import ModelSelector from "~/components/ModelSelector";
import RipSelector from "~/components/RipSelector";  
import ThreeDViewer from "~/components/ThreeDViewer";
import ShelfSelector from "~/components/ShelfSelector";
import ShelfQuantitySelector from "~/components/ShelfQuantitySelector";

import { useState } from "react";

export const loader = async () => {
  return json({});
};

export default function App() {
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedRip, setSelectedRip] = useState<string | null>(null);
  const [shelfQuantity, setShelfQuantity] = useState<number>(1);

  return (
    <div style={{ padding: "20px" }}>
    
      
      <h1>Configure Your Shelf Assembly</h1>

      <ShelfSelector onSelect={setSelectedShelf} />
      <ShelfQuantitySelector onSelect={setShelfQuantity} />
      <ModelSelector onSelect={setSelectedModel} />
      <RipSelector onSelect={setSelectedRip} />
   
      {selectedShelf && selectedModel && selectedRip && (
        <ThreeDViewer 
          modelUrl={selectedModel} 
          shelfUrl={selectedShelf} 
          ripUrl={selectedRip} 
          shelfQuantity={shelfQuantity} 
        />
      )}

      <Outlet />
    </div>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div>
      <h1>Error occurred</h1>
   
      <p>{typeof error === 'object' && error !== null ? error.message : "An unknown error occurred."}</p>
    </div>
  );
}
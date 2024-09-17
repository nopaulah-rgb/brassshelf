import { json } from "@remix-run/node";
import { Outlet, useRouteError } from "@remix-run/react";
import { useState } from "react";

// Components
import ModelSelector from "~/components/ModelSelector";
import RipSelector from "~/components/RipSelector";  
import ThreeDViewer from "~/components/ThreeDViewer";
import ShelfSelector from "~/components/ShelfSelector";
import ShelfQuantitySelector from "~/components/ShelfQuantitySelector";

// Loader to fetch any necessary data
export const loader = async () => {
  return json({});
};

export default function App() {
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedRip, setSelectedRip] = useState<string | null>(null);
  const [shelfQuantity, setShelfQuantity] = useState<number>(1);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Configure Your Shelf Assembly</h1>

      {/* First Row: Shelf, Shelf Quantity, and Rip Selections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ShelfSelector onSelect={setSelectedShelf} />
        <ShelfQuantitySelector onSelect={setShelfQuantity} />
        <RipSelector onSelect={setSelectedRip} />
      </div>

      {/* Model Selector */}
      <div className="mb-6">
        <ModelSelector onSelect={setSelectedModel} />
      </div>

      {/* Centered 3D Viewer directly below ModelSelector */}
      {selectedShelf && selectedModel && selectedRip ? (
        <div className="flex justify-center mb-2">
          <div className=" ">
            <ThreeDViewer 
              modelUrl={selectedModel} 
              shelfUrl={selectedShelf} 
              ripUrl={selectedRip} 
              shelfQuantity={shelfQuantity} 
            />
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center">Please select a shelf, model, and rip to view the 3D configuration.</p>
      )}

      <Outlet />
    </div>
  );
}

// Error boundary to catch errors
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-red-600">Error occurred</h1>
      <p className="text-lg">
        {error instanceof Error ? error.message : "An unknown error occurred."}
      </p>
    </div>
  );
}

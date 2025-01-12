import { json } from "@remix-run/node";
import { Outlet, useRouteError } from "@remix-run/react";
import { useState } from "react";

// Components
import ModelSelector from "~/components/ModelSelector";
import RipSelector from "~/components/RipSelector";
import ThreeDViewer from "~/components/ThreeDViewer";
import ShelfSelector from "~/components/ShelfSelector";
import ShelfQuantitySelector from "~/components/ShelfQuantitySelector";
import MountTypeSelector from "~/components/MountTypeSelector";
import BarSelector from "~/components/BarSelector";

// Loader function for server-side data fetching (if needed)
export const loader = async () => {
  return json({});
};

export default function Index() {
  // State for storing user selections
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedRip, setSelectedRip] = useState<string | null>(null);
  const [shelfQuantity, setShelfQuantity] = useState<number>(1);
  const [mountType, setMountType] = useState<string | null>(null);
  const [barCount, setBarCount] = useState<number>(1);

  // Determine if all necessary selections have been made
  const isViewerReady = selectedShelf && selectedModel && selectedRip && mountType;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Configure Your Shelf Assembly
      </h1>

      {/* Selection Components for Shelf, Quantity, Rip, Mount Type, and Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <ShelfSelector onSelect={setSelectedShelf} />
        <ShelfQuantitySelector onSelect={setShelfQuantity} />
        <RipSelector onSelect={setSelectedRip} />
        <MountTypeSelector onSelect={setMountType} />
        <BarSelector onSelect={setBarCount} />
      </div>

      {/* Model Selector Component */}
      <div className="mb-6">
        <ModelSelector onSelect={setSelectedModel} />
      </div>

      {/* Conditional Rendering for the 3D Viewer */}
      {isViewerReady ? (
        <div className="flex justify-center mb-6">
          <ThreeDViewer
            modelUrl={selectedModel!}
            shelfUrl={selectedShelf!}
            ripUrl={selectedRip!}
            shelfQuantity={shelfQuantity}
            mountType={mountType!}
            barCount={barCount}
          />
        </div>
      ) : (
        <p className="text-gray-500 text-center">
          Please select all options (shelf, model, rip, and mounting type) to view the 3D configuration.
        </p>
      )}

      {/* Render Outlet for nested routes */}
      <Outlet />
    </div>
  );
}

// ErrorBoundary for handling errors gracefully
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold text-red-600">An Error Occurred</h1>
      <p className="text-lg text-gray-700 mt-4">
        {error instanceof Error ? error.message : "An unknown error occurred."}
      </p>
    </div>
  );
}

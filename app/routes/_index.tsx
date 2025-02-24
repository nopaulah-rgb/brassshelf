import { json } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import { useState } from "react";
import ThreeDViewer from "~/components/ThreeDViewer";
import { CrossbarSelector } from "~/components/CrossbarSelector";

// Components
import ModelSelector from "~/components/ModelSelector";
import RipSelector from "~/components/RipSelector";
import ShelfSelector from "~/components/ShelfSelector";
import ShelfQuantitySelector from "~/components/ShelfQuantitySelector";
import MountTypeSelector from "~/components/MountTypeSelector";
import BarSelector from "~/components/BarSelector";

// Loader function for server-side data fetching (if needed)
export const loader = async () => {
  return json({});
};

export default function Index() {
  // State for storing user selections - başlangıç değerlerini null yap
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedRip, setSelectedRip] = useState<string | null>(null);
  const [shelfQuantity, setShelfQuantity] = useState<number>(1);
  const [mountType, setMountType] = useState<string>("Ceiling");
  const [barCount, setBarCount] = useState<number>(1);
  //const [price] = useState<number>(599.00);

  // Add new state for crossbars
  const [showCrossbars, setShowCrossbars] = useState<boolean>(true);

  // Determine if all necessary selections have been made
  const isViewerReady = selectedShelf && selectedModel && selectedRip;

  return (
    <div className="min-h-screen bg-olive-100">
      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center">
        <h1 className="text-lg md:text-xl lg:text-2xl">Origin Shelf Builder</h1>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6">
        {/* Flex container - mobilde dikey, tablet ve üstünde yatay */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sol Panel - Konfigürasyon */}
          <div className="w-full lg:w-1/3">
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold mb-6">Configure Your Shelf Assembly</h2>
              
              <div className="space-y-4 md:space-y-6">
                <ShelfSelector onSelect={setSelectedShelf} />
                <ShelfQuantitySelector onSelect={setShelfQuantity} />
                <RipSelector onSelect={setSelectedRip} />
                <MountTypeSelector onSelect={setMountType} />
                <BarSelector onSelect={setBarCount} />
                <CrossbarSelector
                  showCrossbars={showCrossbars}
                  onChange={setShowCrossbars}
                />
                <ModelSelector onSelect={setSelectedModel} />
              </div>
            </div>
          </div>

          {/* Sağ Panel - 3D Viewer */}
          <div className="w-full lg:w-2/3">
            {isViewerReady ? (
              <div className="w-full h-[400px] md:h-[500px] lg:h-[600px]">
                <ThreeDViewer
                  modelUrl={selectedModel}
                  shelfUrl={selectedShelf}
                  ripUrl={selectedRip}
                  shelfQuantity={shelfQuantity}
                  mountType={mountType}
                  barCount={barCount}
                  showCrossbars={showCrossbars}
                />
              </div>
            ) : (
              <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-100 flex flex-col items-center justify-center p-4 md:p-6">
                <div className="text-center max-w-md">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-600 mb-3 md:mb-4">
                    Please Configure Your Shelfs
                  </h2>
                  <p className="text-sm md:text-base lg:text-lg text-gray-500 px-4">
                    Select options from the left panel to view your custom shelf
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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

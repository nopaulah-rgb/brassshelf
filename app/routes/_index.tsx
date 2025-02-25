import { json } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import { useState } from "react";
import ThreeDViewer from "~/components/ThreeDViewer";
import CrossbarSelector from "~/components/CrossbarSelector";

// Components
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
  const [selectedRip, setSelectedRip] = useState<string | null>(null);
  const [shelfQuantity, setShelfQuantity] = useState<number>(1);
  const [mountType, setMountType] = useState<string>("Ceiling");
  const [barCount, setBarCount] = useState<number>(1);
  //const [price] = useState<number>(599.00);

  // Add new state for crossbars
  const [showCrossbars, setShowCrossbars] = useState(true);

  // Determine if all necessary selections have been made
  const isViewerReady = selectedShelf && selectedRip;

  return (
    <div className="min-h-screen bg-[#B5B48F]">
      <header className="p-6 border-b border-gray-800/10">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Origin Shelf Builder</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Konfigurasyon Paneli */}
          <div className="w-full lg:w-1/3 space-y-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Configure Your Shelf Assembly
              </h2>
              
              <div className="space-y-12">
                <ShelfSelector onSelect={setSelectedShelf} />
                <ShelfQuantitySelector onSelect={setShelfQuantity} />
                <RipSelector onSelect={setSelectedRip} />
                <MountTypeSelector onSelect={setMountType} />
                <BarSelector onSelect={setBarCount} />
                <CrossbarSelector
                  showCrossbars={showCrossbars}
                  onChange={setShowCrossbars}
                />
              </div>
            </div>
          </div>

          {/* 3D Viewer Paneli */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {isViewerReady ? (
                <div className="w-full h-[500px] lg:h-[700px]">
                  <ThreeDViewer
                    shelfUrl={selectedShelf}
                    ripUrl={selectedRip}
                    shelfQuantity={shelfQuantity}
                    mountType={mountType}
                    barCount={barCount}
                    showCrossbars={showCrossbars}
                  />
                </div>
              ) : (
                <div className="w-full h-[500px] lg:h-[700px] flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                      Please Configure Your Shelfs
                    </h2>
                    <p className="text-gray-500">
                      Select options from the left panel to view your custom shelf
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
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

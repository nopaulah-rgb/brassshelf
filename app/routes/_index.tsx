import { json } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import { useState } from "react";
import ThreeDViewer from "~/components/ThreeDViewer";
import CrossbarSelector from "~/components/CrossbarSelector";
import HeightInput from "~/components/HeightInput";
import UseTopShelfSelector from "~/components/UseTopShelfSelector";

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
  const [userHeight, setUserHeight] = useState<number>(1194); // 47 inches in mm
  const [useTopShelf, setUseTopShelf] = useState<boolean>(false); // Default to false for wall mounts
  //const [price] = useState<number>(599.00);

  // Add new state for crossbars
  const [showCrossbars, setShowCrossbars] = useState(true);

  // Determine if all necessary selections have been made
  const isViewerReady = selectedShelf && selectedRip;

  return (
    <div className="min-h-screen bg-[#B5B48F]">
      <header className="p-6 border-b border-gray-800/10">
        <div className="container mx-auto">
          <h1 className="text-2xl font-medium text-gray-900">Origin Shelf Builder</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Configuration Panel */}
          <div className="w-full lg:w-1/3 space-y-8">
            {/* Bays Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-gray-900">Bays</h2>
                <span className="text-xl font-medium text-gray-900">{barCount}</span>
              </div>
              <div className="border-t border-gray-800/10 mb-4" />
              <BarSelector onSelect={setBarCount} />
            </div>

            {/* Shelf Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-gray-900">Shelf</h2>
                <span className="text-xl font-medium text-gray-900">{shelfQuantity}</span>
              </div>
              <div className="border-t border-gray-800/10 mb-4" />
              <div className="space-y-6">
                <h3 className="text-lg text-gray-800">Select a Shelf:</h3>
                <ShelfQuantitySelector onSelect={setShelfQuantity} />
                <ShelfSelector onSelect={setSelectedShelf} />
              </div>
            </div>

            {/* Mount Type Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-gray-900">How would you like to mount your unit?</h2>
                <span className="text-xl font-medium text-gray-900">{mountType}</span>
              </div>
              <div className="border-t border-gray-800/10 mb-4" />
              <MountTypeSelector onSelect={setMountType} />
              <div className="mt-4">
                <UseTopShelfSelector
                  mountType={mountType.toLowerCase()}
                  useTopShelf={useTopShelf}
                  onChange={setUseTopShelf}
                />
              </div>
              <div className="mt-4">
                <HeightInput
                  mountType={mountType.toLowerCase()}
                  value={userHeight}
                  onChange={setUserHeight}
                />
              </div>
            </div>

            {/* Rip Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-gray-900">Rip Style</h2>
              </div>
              <div className="border-t border-gray-800/10 mb-4" />
              <RipSelector onSelect={setSelectedRip} />
            </div>

            {/* Crossbar Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-gray-900">Would you like horizontal cross bars?</h2>
              </div>
              <div className="border-t border-gray-800/10 mb-4" />
              <CrossbarSelector
                showCrossbars={showCrossbars}
                onChange={setShowCrossbars}
              />
            </div>
          </div>

          {/* 3D Viewer Panel */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white/5 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm">
              {isViewerReady ? (
                <div className="w-full h-[500px] lg:h-[700px]">
                  <ThreeDViewer
                    shelfUrl={selectedShelf}
                    ripUrl={selectedRip}
                    shelfQuantity={shelfQuantity}
                    mountType={mountType.toLowerCase()}
                    barCount={barCount}
                    showCrossbars={showCrossbars}
                    userHeight={userHeight}
                    useTopShelf={useTopShelf}
                  />
                </div>
              ) : (
                <div className="w-full h-[500px] lg:h-[700px] flex items-center justify-center p-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-medium text-white mb-2">
                      Please Configure Your Shelf
                    </h2>
                    <p className="text-gray-200">
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
